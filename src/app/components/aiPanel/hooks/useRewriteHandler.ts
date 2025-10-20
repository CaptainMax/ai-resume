// src/app/components/aiPanel/hooks/useRewriteHandler.ts
"use client";

import { useResumeStore } from "@/app/store/useResumeStore";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function useRewriteHandler() {
  const { sections, selectedPoint, updatePoint, setLastModifiedPoint } = useResumeStore();

  // 检查是否是重写请求 - 简化逻辑，让AI自己判断
  const isRewriteRequest = (message: string) => {
    return message.toLowerCase().includes('rewrite') || 
           message.toLowerCase().includes('重写') ||
           message.toLowerCase().includes('improve') ||
           message.toLowerCase().includes('优化');
  };

  // 处理AI的重写回复
  const handleRewriteResponse = (aiResponse: string, messages: ChatMsg[]) => {
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    console.log("🔍 检查重写请求:", lastUserMessage);
    console.log("🔍 是否有选中的point:", !!selectedPoint);
    console.log("🔍 是否是重写请求:", isRewriteRequest(lastUserMessage));
    
    if (selectedPoint && isRewriteRequest(lastUserMessage)) {
      // 提取AI回复中的重写内容（去掉可能的引号或格式）
      let rewrittenContent = aiResponse.trim();
      
      // 移除可能的markdown格式或引号
      rewrittenContent = rewrittenContent.replace(/^[-•]\s*/, ''); // 移除开头的bullet point
      rewrittenContent = rewrittenContent.replace(/^["']|["']$/g, ''); // 移除首尾引号
      
      // 保存原始内容和重写内容，显示确认对话框
      const { sectionId, fieldId, pointId } = selectedPoint;
      const section = sections.find((s) => s.id === sectionId);
      const field = section?.fields.find((f) => f.id === fieldId);
      const point = field?.points?.find((p) => p.id === pointId);
      
      if (point) {
        // 先保存原始内容用于撤销
        const originalContent = point.content;
        
        // 然后更新内容
        updatePoint(sectionId, fieldId, pointId, rewrittenContent);
        
        // 保存原始内容用于撤销
        setLastModifiedPoint({
          sectionId,
          fieldId,
          pointId,
          originalContent: originalContent
        });
        
        console.log("✅ 已更新point内容，等待用户确认:", rewrittenContent);
        console.log("📝 原始内容已保存:", originalContent);
        
        return true; // 表示需要显示确认对话框
      }
    }
    
    return false; // 不需要显示确认对话框
  };

  return { isRewriteRequest, handleRewriteResponse };
}
