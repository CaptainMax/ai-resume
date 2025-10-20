// src/app/components/aiPanel/AiPanel.tsx
"use client";

import { useState } from "react";
import SelectionEditor from "./SelectionEditor";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useResumeStore } from "@/app/store/useResumeStore";
import { useAiChat } from "./hooks/useAiChat";
import { useConfirmationHandler } from "./hooks/useConfirmationHandler";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function AiPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUndoPrompt, setShowUndoPrompt] = useState(false);
  
  const { sections, selectedId, selectedField, selectedPoint } = useResumeStore();
  const { handleSend } = useAiChat();
  const { handleConfirmKeep, handleUndoLastAction } = useConfirmationHandler();

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

  return (
    <div className="flex flex-col h-full">
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
        <ChatInput onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
}