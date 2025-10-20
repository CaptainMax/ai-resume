"use client";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function ChatMessages({
  messages,
  showUndoPrompt,
  onConfirmKeep,
  onUndoLastAction,
}: {
  messages: ChatMsg[];
  showUndoPrompt: boolean;
  onConfirmKeep: () => void;
  onUndoLastAction: () => void;
}) {
  // 检查用户是否要求英文回复
  const shouldUseEnglish = () => {
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    return lastUserMessage?.content.includes("不要出现中文") || lastUserMessage?.content.includes("no Chinese");
  };
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
      
      {/* 确认和撤销按钮 */}
      {showUndoPrompt && (
        <div className="rounded border p-3 bg-yellow-50 border-yellow-200">
          <div className="text-sm text-yellow-800 mb-3">
            {shouldUseEnglish() 
              ? "🤖 AI has generated new content. Do you want to keep these changes?"
              : "🤖 AI已生成新的内容。您想保留这些修改吗？"
            }
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onConfirmKeep}
              className="px-4 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
            >
              {shouldUseEnglish() ? "✅ Keep" : "✅ 保留"}
            </button>
            <button
              onClick={onUndoLastAction}
              className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
            >
              {shouldUseEnglish() ? "↩️ Undo" : "↩️ 撤销"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
