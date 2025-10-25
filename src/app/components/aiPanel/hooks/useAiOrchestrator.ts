// src/app/components/aiPanel/hooks/useAiOrchestrator.ts
// 🧭 AI编排器Hook - 处理所有AI相关的逻辑

import { useState } from 'react';
import { useResumeStore } from '@/app/store/useResumeStore';

export interface AiOrchestratorState {
  isLoading: boolean;
  error: string | null;
  lastResult: any | null;
}

export const useAiOrchestrator = () => {
  const [state, setState] = useState<AiOrchestratorState>({
    isLoading: false,
    error: null,
    lastResult: null
  });

  const { sections, selectedId, selectedField, selectedPoint, setSections } = useResumeStore();

  /**
   * 🧭 执行AI编排处理 - 真正的推理驱动编排
   */
  const executeIntentAction = async (userInput: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 🧠 Step 1: 使用LLM进行意图分析
      logStage("intent-analysis-start", { userInput });
      const { intent, entities, confidence, reasoning } = await analyzeIntent(userInput);
      logStage("intent-detected", { intent, entities, confidence, reasoning });

      // 🎯 Step 2: 置信度检查
      if (confidence < 0.6) {
        logStage("low-confidence", { confidence, threshold: 0.6 });
        return {
          success: false,
          message: "无法确定您的意图，请尝试更明确的表达。"
        };
      }

      // 🧭 Step 3: 动态Agent路由
      logStage("agent-routing-start", { intent, entities });
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          entities,
          context: { 
            sections,
            selectedPoint,
            selectedField,
            selectedSection: selectedId ? sections.find(s => s.id === selectedId) : null
          },
          userId: 'user-123'
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '编排处理失败');
      }

      logStage("agent-executed", { 
        agent: intent, 
        success: result.success,
        confidence: result.data?.confidence 
      });

      // 🎯 Step 4: 低置信度反思
      if (result.data?.confidence < 0.75) {
        logStage("reflection-triggered", { confidence: result.data.confidence });
        await triggerReflection(userInput, result.data);
      }

      // 📊 Step 5: 反馈学习
      logStage("feedback-collection-start");
      await collectLLMFeedback({
        userId: 'user-123',
        reasoning: {
          intent,
          entities,
          confidence,
          reasoning
        },
        success: result.success,
        accuracy: result.data?.confidence || confidence
      });
      logStage("feedback-sent");

      // 📝 Step 6: 结果处理
      const message = result.message || result.data?.result?.message || 
        `✅ 操作成功完成 (意图: ${intent}, 置信度: ${(confidence * 100).toFixed(1)}%)`;
      
      // 🔄 处理updatedResume（如果有的话）
      if (result.updatedResume) {
        console.log("🔄 收到AI Agent更新的简历数据:", result.updatedResume);
        setSections(result.updatedResume);
        logStage("resume-updated", { sectionsCount: result.updatedResume.length });
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastResult: result.data 
      }));

      logStage("orchestration-complete", { success: true, message });

      return {
        success: true,
        message,
        data: result.data
      };

    } catch (error) {
      console.error('❌ 编排处理失败:', error);
      const errorMessage = "抱歉，操作执行时遇到问题。请稍后再试。";
      
      // 📊 记录失败反馈
      await collectLLMFeedback({
        userId: 'user-123',
        reasoning: { error: error instanceof Error ? error.message : String(error) },
        success: false,
        accuracy: 0
      });

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));

      logStage("orchestration-failed", { error: errorMessage });

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  /**
   * 🧠 使用LLM进行真正的意图分析
   */
  const analyzeIntent = async (userInput: string) => {
    const res = await fetch("/api/llm-reasoning/analyze_intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput })
    });
    return res.json(); // { intent, entities, confidence }
  };

  /**
   * 📊 结构化日志记录
   */
  const logStage = (stage: string, data: any = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`🧭 [${timestamp}] ${stage}:`, data);
  };

  /**
   * 🎯 触发反思机制
   */
  const triggerReflection = async (userInput: string, result: any) => {
    try {
      const response = await fetch('/api/llm-reasoning/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userInput, 
          output: result,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        logStage("reflection-complete");
      }
    } catch (error) {
      console.error('❌ 反思机制失败:', error);
    }
  };

  /**
   * 🧠 收集 LLM 推理反馈
   */
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
        logStage("feedback-collected", { success: true });
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

  return {
    state,
    executeIntentAction,
    analyzeIntent,
    collectLLMFeedback
  };
};
