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
      // 🧠 通过后端API处理推理，避免前端直接使用OpenAI
      logStage("reasoning-start", { userInput });
      
      const response = await fetch('/api/ai-orchestration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          resumeData: { sections },
          userId: 'user-123'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      logStage("api-response-received", { success: data.success });

      // 🔄 更新简历数据
      if (data.result?.result?.updatedResume?.sections) {
        console.log("🔄 收到编排器更新的简历数据:", data.result.result.updatedResume.sections);
        setSections(data.result.result.updatedResume.sections);
        logStage("resume-updated", { sectionsCount: data.result.result.updatedResume.sections.length });
      }

      // 计算成功步骤数
      const agentsUsed = data.result?.agentsUsed || [];
      const successCount = data.result?.success ? agentsUsed.length : 0;
      const totalSteps = agentsUsed.length;
      const message = `✅ 推理执行完成 (${successCount}/${totalSteps} 步骤成功)`;
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastResult: data
      }));

      logStage("reasoning-complete", { success: true, message });

      return {
        success: true,
        message,
        data: { plan: data.plan, results: data.results }
      };

    } catch (error) {
      console.error('❌ 推理执行失败:', error);
      const errorMessage = "抱歉，推理执行时遇到问题。请稍后再试。";
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));

      logStage("reasoning-failed", { error: errorMessage });

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  /**
   * 📊 结构化日志记录
   */
  const logStage = (stage: string, data: any = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`🧭 [${timestamp}] ${stage}:`, data);
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
    collectLLMFeedback
  };
};
