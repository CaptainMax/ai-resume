// src/app/components/aiPanel/AiPanel.tsx
"use client";

import { useState } from "react";
import SelectionEditor from "./SelectionEditor"; // ✅ 替换 BlockEditor
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function AiPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const handleSend = (msg: string) => {
    setMessages((m) => [...m, { role: "user", content: msg }]);

    // TODO: 后续接入 GPT API（可携带当前选中 Field/Point 的上下文）
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "AI 回复示例: " + msg },
      ]);
    }, 500);
  };

  return (
    <aside className="w-[460px] h-full flex flex-col bg-white border-l">
      {/* 顶部：所选 Section/Field/Point 编辑 */}
      <div className="p-4 border-b">
        <SelectionEditor />
      </div>

      {/* 中间：消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <ChatMessages messages={messages} />
      </div>

      {/* 底部：输入框 */}
      <div className="border-t p-3 bg-white">
        <ChatInput onSend={handleSend} />
      </div>
    </aside>
  );
}
