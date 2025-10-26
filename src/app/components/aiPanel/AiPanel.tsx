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
import ParseStatusIndicator from "../ParseStatusIndicator";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function AiPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUndoPrompt, setShowUndoPrompt] = useState(false);
  const [showFeedbackConfirmation, setShowFeedbackConfirmation] = useState(false);
  const [showLearningInsights, setShowLearningInsights] = useState(false);
  const [showConfidenceEvolution, setShowConfidenceEvolution] = useState(false);
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
  const { recordOriginalData, sendFeedback } = useFeedbackCollection();
  

  // 处理发送消息
  const onSend = (msg: string) => {
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
    </div>
  );
}