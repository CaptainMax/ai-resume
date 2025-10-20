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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="border-t p-3">
      <div className="rounded-md border bg-white focus-within:ring-2 focus-within:ring-indigo-400">
        <textarea
          ref={ref}
          className="w-full resize-none rounded-md p-2 text-sm leading-6 outline-none"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isLoading ? "AI正在思考中..." : "输入给 AI 的指令… (Enter 发送, Shift+Enter 换行)"}
          disabled={isLoading}
        />
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={send}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-white text-sm ${
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
