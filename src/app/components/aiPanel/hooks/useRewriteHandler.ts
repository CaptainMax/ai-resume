// src/app/components/aiPanel/hooks/useRewriteHandler.ts
"use client";

import { useResumeStore } from "@/app/store/useResumeStore";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function useRewriteHandler() {
  const { sections, selectedPoint, updatePoint, setLastModifiedPoint, addAiModifiedPoint, setAiOriginalContent } = useResumeStore();

  // 检查是否是重写请求 - 简化逻辑，让AI自己判断
  const isRewriteRequest = (message: string) => {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('rewrite') || 
           lowerMessage.includes('re-write') ||
           lowerMessage.includes('re write') ||
           lowerMessage.includes('重写') ||
           lowerMessage.includes('improve') ||
           lowerMessage.includes('优化') ||
           lowerMessage.includes('enhance') ||
           lowerMessage.includes('polish') ||
           lowerMessage.includes('refine');
  };

  // 处理AI的重写回复
  const handleRewriteResponse = (aiResponse: string, messages: ChatMsg[]) => {
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    console.log("🔍 检查重写请求:", lastUserMessage);
    console.log("🔍 是否有选中的point:", !!selectedPoint);
    console.log("🔍 是否是重写请求:", isRewriteRequest(lastUserMessage));
    console.log("🔍 AI回复内容:", aiResponse);
    
    if (selectedPoint && isRewriteRequest(lastUserMessage)) {
      // 检查AI回复是否包含JSON（结构化操作）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // 如果是JSON，让结构化操作处理器处理
        return false;
      }
      
      // 如果AI直接返回重写内容（非JSON），直接使用
      let rewrittenContent = aiResponse.trim();
      
      // 移除可能的markdown格式或引号
      rewrittenContent = rewrittenContent.replace(/^[-•]\s*/, ''); // 移除开头的bullet point
      rewrittenContent = rewrittenContent.replace(/^["']|["']$/g, ''); // 移除首尾引号
      
      // 过滤掉常见的非重写内容
      const skipPhrases = [
        "sure, i can help",
        "i'd be happy to help",
        "please provide",
        "could you please",
        "i need more information",
        "here's a rewritten version",
        "here is a rewritten version"
      ];
      
      const shouldSkip = skipPhrases.some(phrase => 
        rewrittenContent.toLowerCase().includes(phrase)
      );
      
      if (shouldSkip) {
        console.log("⚠️ AI回复不是重写内容，跳过处理");
        return false;
      }
      
      // 检查是否是实际的重写内容（包含动词和具体描述）
      const hasActionWords = /\b(engaged|participated|developed|implemented|created|designed|analyzed|tested|integrated|collaborated|managed|led|improved|optimized|delivered|achieved|completed|executed|facilitated|coordinated|supervised|mentored|trained|built|constructed|established|maintained|operated|performed|produced|provided|resolved|supported|utilized|worked)\b/i.test(rewrittenContent);
      
      if (!hasActionWords && rewrittenContent.length < 20) {
        console.log("⚠️ 内容太短或没有动作词，可能不是重写内容");
        return false;
      }
      
      // 保存原始内容和重写内容，显示确认对话框
      const { sectionId, fieldId, pointId } = selectedPoint;
      const section = sections.find((s: any) => s.id === sectionId);
      const field = section?.fields.find((f: any) => f.id === fieldId);
      const point = field?.points?.find((p: any) => p.id === pointId);
      
      if (point) {
        // 先保存原始内容用于撤销
        const originalContent = point.content;
        
        console.log("🔄 开始重写处理:");
        console.log("📝 原始内容:", originalContent);
        console.log("✨ 重写内容:", rewrittenContent);
        console.log("📍 位置信息:", { sectionId, fieldId, pointId });
        
        // 然后更新内容
        updatePoint(sectionId, fieldId, pointId, rewrittenContent);
        
        // 标记为AI修改的内容
        addAiModifiedPoint(pointId);
        
        // 保存原始内容用于显示对比
        setAiOriginalContent(pointId, originalContent);
        
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
      } else {
        console.log("❌ 未找到对应的point:", { sectionId, fieldId, pointId });
      }
    }
    
    return false; // 不需要显示确认对话框
  };

  return { isRewriteRequest, handleRewriteResponse };
}
