"use client";

import { useRef, useState } from "react";
import { useAutosizeTextArea } from "../hooks/useAutosizeTextArea";
export default function ChatInput({ onSend, isLoading = false }: { onSend: (msg: string) => void; isLoading?: boolean }) {
  const [input, setInput] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useAutosizeTextArea(ref.current, input);

  const send = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 或 Cmd+Enter 发送
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="rounded-md border bg-white focus-within:ring-2 focus-within:ring-indigo-400">
        <textarea
          ref={ref}
          className="w-full resize-none rounded-md p-3 text-sm leading-6 outline-none min-h-[120px]"
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isLoading ? "AI正在思考中..." : "输入给 AI 的指令… (Ctrl+Enter 发送, Enter 换行)"}
          disabled={isLoading}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={send}
          disabled={isLoading}
          className={`px-4 py-2 rounded text-white text-sm ${
            isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? "发送中..." : "发送"}
        </button>
      </div>
    </div>
  );
}
