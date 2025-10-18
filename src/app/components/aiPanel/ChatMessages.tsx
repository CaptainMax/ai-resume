"use client";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function ChatMessages({ messages }: { messages: ChatMsg[] }) {
  if (messages.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center mt-8">
        在下方输入指令，例如：<span className="italic">“优化 Skills 区域”</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`rounded border p-2 text-sm whitespace-pre-wrap ${
            m.role === "assistant" ? "bg-white" : "bg-indigo-50"
          }`}
        >
          <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
            {m.role === "assistant" ? "Assistant" : "You"}
          </div>
          {m.content}
        </div>
      ))}
    </div>
  );
}
