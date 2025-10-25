// src/app/components/aiPanel/AiPanel.tsx
"use client";

import { useState } from "react";
import SelectionEditor from "./SelectionEditor";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useResumeStore } from "@/app/store/useResumeStore";
import { useAiChat } from "./hooks/useAiChat";
import { useConfirmationHandler } from "./hooks/useConfirmationHandler";
import { useFeedbackCollection } from "./hooks/useFeedbackCollection";
import FeedbackConfirmation from "./FeedbackConfirmation";
import LearningInsights from "./LearningInsights";
import ConfidenceEvolution from "./ConfidenceEvolution";
import IntentAnalyzer from "./IntentAnalyzer";
import OrchestratorStatus from "./OrchestratorStatus";
import ParseStatusIndicator from "../ParseStatusIndicator";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function AiPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUndoPrompt, setShowUndoPrompt] = useState(false);
  const [showFeedbackConfirmation, setShowFeedbackConfirmation] = useState(false);
  const [showLearningInsights, setShowLearningInsights] = useState(false);
  const [showConfidenceEvolution, setShowConfidenceEvolution] = useState(false);
  const [showIntentAnalyzer, setShowIntentAnalyzer] = useState(false);
  const [showOrchestratorStatus, setShowOrchestratorStatus] = useState(false);
  const [currentUserInput, setCurrentUserInput] = useState("");
  const [feedbackData, setFeedbackData] = useState<{
    aiModifiedContent: string;
    originalContent: string;
    fieldName: string;
  } | null>(null);
  const [parseStatus, setParseStatus] = useState<{
    source: string;
    confidence?: number;
    parseTime?: number;
  } | null>(null);
  
  const { sections, selectedId, selectedField, selectedPoint } = useResumeStore();
  const { handleSend } = useAiChat();
  const { handleConfirmKeep, handleUndoLastAction } = useConfirmationHandler();
  const { recordOriginalData, sendFeedback, collectFeedback } = useFeedbackCollection();

  // 🧠 收集 LLM 推理反馈
  const collectLLMFeedback = async (feedback: {
    userId: string;
    reasoning: any;
    satisfaction?: number;
    accuracy?: number;
    success?: boolean;
    userCorrection?: any;
  }) => {
    try {
      const response = await fetch('/api/llm-reasoning/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (response.ok) {
        console.log('✅ LLM反馈收集成功');
        return true;
      } else {
        console.error('❌ LLM反馈收集失败:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ LLM反馈收集错误:', error);
      return false;
    }
  };

  // 🧠 判断是否需要分析用户意图
  const shouldAnalyzeIntent = (msg: string): boolean => {
    const intentKeywords = [
      '学位', 'degree', '毕业', 'graduate', 'master', 'bachelor',
      '工作', 'work', '经验', 'experience', '公司', 'company',
      '技能', 'skill', '技术', 'technology', '会', '掌握',
      '删除', 'delete', '移除', 'remove', '去掉', '删掉',
      '修改', 'edit', '更新', 'update', '改变', 'change', '优化', 'optimize',
      '替换', 'replace', 'mit', 'university', 'full name'
    ];
    
    return intentKeywords.some(keyword => 
      msg.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // 处理发送消息
  const onSend = (msg: string) => {
    // 🧠 智能意图分析：检查是否需要分析用户意图
    if (shouldAnalyzeIntent(msg)) {
      setCurrentUserInput(msg);
      setShowIntentAnalyzer(true);
      return;
    }
    
    handleSend(msg, sections, selectedId, selectedField, selectedPoint, messages, setMessages, setIsLoading, setShowUndoPrompt);
  };

  // 处理确认保留
  const onConfirmKeep = () => {
    setShowUndoPrompt(false);
    handleConfirmKeep(messages, setMessages);
  };

  // 处理撤销
  const onUndoLastAction = () => {
    setShowUndoPrompt(false);
    handleUndoLastAction(messages, setMessages);
  };

  // 处理反馈确认
  const onFeedbackConfirm = async () => {
    setShowFeedbackConfirmation(false);
    setFeedbackData(null);
    // 反馈已通过FeedbackConfirmation组件发送
  };

  // 处理反馈撤销
  const onFeedbackUndo = async () => {
    setShowFeedbackConfirmation(false);
    setFeedbackData(null);
    // 反馈已通过FeedbackConfirmation组件发送
  };

  // 🤖 执行智能意图操作 - 使用 AgentOrchestrator
  const executeIntentAction = async (userInput: string) => {
    try {
      console.log("🎯 使用AgentOrchestrator分析:", userInput);
      
      // 1. 使用 AgentOrchestrator 进行智能编排
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          context: { 
            sections,
            selectedPoint,
            selectedField,
            selectedSection: selectedId ? sections.find(s => s.id === selectedId) : null
          },
          userId: 'user-123',
          priority: 'medium'
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Agent编排失败');
      }

      const result = data.data;
      console.log("✅ Agent编排结果:", result);
      
      // 2. AgentOrchestrator已经处理了执行，直接显示结果
      if (result.success) {
        // 关闭意图分析对话框
        setShowIntentAnalyzer(false);
        
        // 显示成功消息
        const successMessage = result.suggestions && result.suggestions.length > 0 
          ? result.suggestions.join('; ')
          : `✅ 操作成功完成 (使用 ${result.agentsUsed.length} 个AI Agent)`;
        
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: successMessage
        }]);
        
        // 收集反馈（自动记录成功操作）
        await collectLLMFeedback({
          userId: 'user-123',
          reasoning: result.result,
          satisfaction: 0.8, // 默认满意度
          accuracy: 0.8, // 默认准确性
          success: true
        });
      } else {
        throw new Error(result.error || 'Agent编排执行失败');
      }
      
      // 6. 调试信息：显示当前字段结构
      console.log('🔍 当前所有字段:', sections.map(s => ({
        section: s.title,
        fields: s.fields?.map(f => ({ name: f.name, value: f.value }))
      })));

    } catch (error) {
      console.error('❌ LLM推理执行失败:', error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "抱歉，LLM推理执行时遇到问题。请稍后再试。" 
      }]);
      
      // 收集失败反馈
      await collectFeedback({
        reasoning: { action: 'unknown', target: 'unknown', entity: 'unknown', data: {}, confidence: 0, reasoning: 'LLM推理执行失败' },
        satisfaction: 0.2, // 低满意度
        accuracy: 0.2, // 低准确性
        success: false
      });
    }
  };

  // 添加教育经历字段
  const addEducationField = async (details: any) => {
    const { addField } = useResumeStore.getState();
    
    // 找到Education section
    const educationSection = sections.find(s => 
      s.title.toLowerCase().includes('education') || 
      s.title.toLowerCase().includes('教育')
    );
    
    if (!educationSection) {
      throw new Error('未找到Education section');
    }

    // 创建新的教育字段 - 用实际大学名替换字段名
    const universityName = details.institution || 'University Name';
    const newField = {
      id: `field-${Date.now()}`,
      name: universityName, // 🎯 用实际大学名替换字段名
      value: universityName,
      points: [
        {
          id: `point-${Date.now()}-1`,
          content: `Degree: ${details.degree || 'Degree'}`
        },
        {
          id: `point-${Date.now()}-2`,
          content: `Date: ${details.time || 'Date'}`
        },
        ...(details.major ? [{
          id: `point-${Date.now()}-3`,
          content: `Major: ${details.major}`
        }] : [])
      ]
    };

    addField(educationSection.id, newField);
  };

  // 添加工作经历字段
  const addExperienceField = async (details: any) => {
    const { addField } = useResumeStore.getState();
    
    // 找到Work Experience section
    const workSection = sections.find(s => 
      s.title.toLowerCase().includes('work') || 
      s.title.toLowerCase().includes('experience') ||
      s.title.toLowerCase().includes('工作')
    );
    
    if (!workSection) {
      throw new Error('未找到Work Experience section');
    }

    // 创建新的工作字段
    const newField = {
      id: `field-${Date.now()}`,
      name: 'Company Name',
      value: details.institution || 'Company Name',
      points: [
        {
          id: `point-${Date.now()}-1`,
          content: `Position: ${details.position || 'Position'}`
        },
        {
          id: `point-${Date.now()}-2`,
          content: `Date: ${details.time || 'Date'}`
        }
      ]
    };

    addField(workSection.id, newField);
  };

  // 添加技能字段
  const addSkillField = async (details: any) => {
    const { addField } = useResumeStore.getState();
    
    // 找到Technical Skills section
    const skillsSection = sections.find(s => 
      s.title.toLowerCase().includes('skill') || 
      s.title.toLowerCase().includes('technical') ||
      s.title.toLowerCase().includes('技能')
    );
    
    if (!skillsSection) {
      throw new Error('未找到Technical Skills section');
    }

    // 为每个技能创建point
    const skillPoints = details.skills?.map((skill: string, index: number) => ({
      id: `point-${Date.now()}-${index}`,
      content: skill
    })) || [];

    // 创建新的技能字段
    const newField = {
      id: `field-${Date.now()}`,
      name: 'Skills',
      value: undefined,
      points: skillPoints
    };

    addField(skillsSection.id, newField);
  };

  // 执行删除操作
  const executeDeleteAction = async () => {
    const { removePoint } = useResumeStore.getState();
    
    // 如果有选中的point，删除它
    if (selectedPoint) {
      removePoint(selectedPoint.sectionId, selectedPoint.fieldId, selectedPoint.pointId);
      console.log("🗑️ 已删除选中的point:", selectedPoint);
    } else {
      throw new Error('没有选中的point可以删除');
    }
  };

  // 执行编辑操作
  const executeEditAction = async () => {
    // TODO: 实现编辑操作逻辑
    console.log("✏️ 执行编辑操作");
  };

  // 🎯 执行MIT替换操作
  const executeMitReplacement = async () => {
    try {
      const { updateFieldValue } = useResumeStore.getState();
      
      // 找到Education section
      const educationSection = sections.find(s => 
        s.title.toLowerCase().includes('education') || 
        s.title.toLowerCase().includes('教育')
      );
      
      if (!educationSection) {
        throw new Error('未找到Education section');
      }
      
      console.log('🔍 搜索MIT字段，当前字段:', educationSection.fields?.map(f => f.name));
      
      // 更灵活的MIT字段搜索
      const mitField = educationSection.fields?.find(f => {
        const fieldName = f.name?.toLowerCase() || '';
        const fieldValue = f.value?.toLowerCase() || '';
        
        // 检查字段名或值是否包含MIT
        return fieldName.includes('mit') || 
               fieldValue.includes('mit') ||
               fieldName === 'mit' ||
               fieldValue === 'mit';
      });
      
      if (!mitField) {
        // 如果找不到MIT字段，尝试查找任何包含"mit"的字段
        const anyMitField = educationSection.fields?.find(f => {
          const fieldName = f.name?.toLowerCase() || '';
          const fieldValue = f.value?.toLowerCase() || '';
          return fieldName.includes('mit') || fieldValue.includes('mit');
        });
        
        if (anyMitField) {
          console.log('🎯 找到可能的MIT字段:', anyMitField.name);
          // 执行替换
          updateFieldValue(educationSection.id, anyMitField.id, 'Massachusetts Institute of Technology');
          console.log('✅ MIT已替换为完整名称');
          return true;
        } else {
          throw new Error('未找到MIT字段，请检查字段名称');
        }
      }
      
      // 执行替换
      updateFieldValue(educationSection.id, mitField.id, 'Massachusetts Institute of Technology');
      
      console.log('✅ MIT已替换为完整名称');
      return true;
    } catch (error) {
      console.error('❌ MIT替换失败:', error);
      return false;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 解析状态指示器 */}
      {parseStatus && (
        <div className="flex-shrink-0 p-3 border-b border-gray-200">
          <ParseStatusIndicator 
            source={parseStatus.source}
            confidence={parseStatus.confidence}
            parseTime={parseStatus.parseTime}
          />
        </div>
      )}
      
      {/* 选中内容编辑器 */}
      <div className="flex-1 overflow-y-auto">
        <SelectionEditor />
      </div>

      {/* AI 聊天消息区域 */}
      <div className="flex-1 overflow-y-auto">
        <ChatMessages
          messages={messages}
          showUndoPrompt={showUndoPrompt}
          onConfirmKeep={onConfirmKeep}
          onUndoLastAction={onUndoLastAction}
        />
      </div>

      {/* AI 输入框 - 固定在底部 */}
      <div className="flex-shrink-0 border-t">
        <ChatInput
          onSend={onSend}
          isLoading={isLoading}
          onShowLearningInsights={() => setShowLearningInsights(true)}
          onShowConfidenceEvolution={() => setShowConfidenceEvolution(true)}
          onShowOrchestratorStatus={() => setShowOrchestratorStatus(true)}
        />
      </div>

      {/* 反馈确认对话框 */}
      {feedbackData && (
        <FeedbackConfirmation
          isVisible={showFeedbackConfirmation}
          onConfirm={onFeedbackConfirm}
          onUndo={onFeedbackUndo}
          aiModifiedContent={feedbackData.aiModifiedContent}
          originalContent={feedbackData.originalContent}
          fieldName={feedbackData.fieldName}
        />
      )}

      {/* 学习洞察对话框 */}
      <LearningInsights
        userId="user-123" // TODO: 从实际用户ID获取
        isVisible={showLearningInsights}
        onClose={() => setShowLearningInsights(false)}
      />

      {/* 置信度进化对话框 */}
      <ConfidenceEvolution
        userId="user-123" // TODO: 从实际用户ID获取
        isVisible={showConfidenceEvolution}
        onClose={() => setShowConfidenceEvolution(false)}
      />

      {/* 智能意图分析对话框 */}
      <IntentAnalyzer
        userInput={currentUserInput}
        isVisible={showIntentAnalyzer}
        onClose={() => setShowIntentAnalyzer(false)}
        onExecuteAction={async (action) => {
          console.log("🤖 执行智能操作:", action);
          await executeIntentAction(currentUserInput);
        }}
      />

      {/* Agent编排器状态对话框 */}
      {showOrchestratorStatus && (
        <OrchestratorStatus 
          userId="user-123"
          onClose={() => setShowOrchestratorStatus(false)}
        />
      )}
    </div>
  );
}