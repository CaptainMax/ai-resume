// src/app/components/aiPanel/hooks/useLanguageDetection.ts
"use client";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function useLanguageDetection() {
  // 检查用户是否要求英文回复
  const shouldUseEnglish = (messages: ChatMsg[]) => {
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    const message = lastUserMessage?.content || "";
    
    // 简单的英文检测 - 让AI自己判断
    return message.toLowerCase().includes("英文") || 
           message.toLowerCase().includes("english") ||
           message.toLowerCase().includes("纯英文") ||
           message.toLowerCase().includes("不要出现中文");
  };

  return { shouldUseEnglish };
}
