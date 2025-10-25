// src/app/components/aiPanel/hooks/useAiChat.ts
"use client";

import { useStructuredActions } from "./useStructuredActions";
import { useRewriteHandler } from "./useRewriteHandler";
import { useLanguageDetection } from "./useLanguageDetection";
import { useResumeStore } from "@/app/store/useResumeStore";
import { ResumeSection } from "@/app/store/types";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function useAiChat() {
  const { handleStructuredAction } = useStructuredActions();
  const { handleRewriteResponse } = useRewriteHandler();
  const { shouldUseEnglish } = useLanguageDetection();
  const { setSections } = useResumeStore();

  const handleSend = async (
    msg: string,
    sections: ResumeSection[],
    selectedId: string | null,
    selectedField: { sectionId: string; fieldId: string } | null,
    selectedPoint: { sectionId: string; fieldId: string; pointId: string } | null,
    messages: ChatMsg[],
    setMessages: (fn: (m: ChatMsg[]) => ChatMsg[]) => void,
    setIsLoading: (loading: boolean) => void,
    setShowUndoPrompt: (show: boolean) => void
  ) => {
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setIsLoading(true);

    try {
      // 构建完整的上下文信息
      const context = {
        // 当前选中的元素
        selected: selectedPoint ? {
          type: "point",
          sectionId: selectedPoint.sectionId,
          fieldId: selectedPoint.fieldId,
          pointId: selectedPoint.pointId,
          sectionTitle: sections.find(s => s.id === selectedPoint.sectionId)?.title,
          fieldName: sections.find(s => s.id === selectedPoint.sectionId)?.fields.find((f: any) => f.id === selectedPoint.fieldId)?.name,
          content: sections.find(s => s.id === selectedPoint.sectionId)?.fields.find((f: any) => f.id === selectedPoint.fieldId)?.points?.find((p: any) => p.id === selectedPoint.pointId)?.content
        } : selectedField ? {
          type: "field",
          sectionId: selectedField.sectionId,
          fieldId: selectedField.fieldId,
          sectionTitle: sections.find(s => s.id === selectedField.sectionId)?.title,
          fieldName: sections.find(s => s.id === selectedField.sectionId)?.fields.find((f: any) => f.id === selectedField.fieldId)?.name,
          points: sections.find(s => s.id === selectedField.sectionId)?.fields.find((f: any) => f.id === selectedField.fieldId)?.points?.map((p: any) => p.content)
        } : selectedId ? {
          type: "section",
          sectionId: selectedId,
          sectionTitle: sections.find(s => s.id === selectedId)?.title,
          fields: sections.find(s => s.id === selectedId)?.fields?.map((f: any) => ({
            id: f.id,
            name: f.name,
            points: f.points?.map((p: any) => p.content)
          }))
        } : null,
        
        // 完整的简历结构（用于AI理解全局上下文）
        resumeStructure: sections.map(section => ({
          id: section.id,
          title: section.title,
          fields: section.fields?.map((field: any) => ({
            id: field.id,
            name: field.name,
            points: field.points?.map((point: any) => ({
              id: point.id,
              content: point.content
            }))
          }))
        }))
      };

      console.log("📤 发送AI请求，上下文:", context);

      const res = await fetch("/api/aiChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, context }),
      });

      const data = await res.json();
      
      if (data.success) {
        // 检查是否有updatedResume（新的AI Agent响应）
        if (data.updatedResume) {
          console.log("🔄 收到AI Agent更新的简历数据:", data.updatedResume);
          setSections(data.updatedResume);
          setShowUndoPrompt(true);
          
          const message = data.response || "✅ AI已根据您的指令进行了修改。请确认是否保留。";
          setMessages((m) => [
            ...m,
            { role: "assistant", content: message },
          ]);
          return;
        }
        
        // 检查是否是结构化操作
        if (data.action && data.data) {
          await handleStructuredAction(data.action, data.data);
          setShowUndoPrompt(true); // 显示undo提示
          
          // 简单的确认消息
          const message = "✅ AI已根据您的指令进行了修改。请确认是否保留。";
          setMessages((m) => [
            ...m,
            { role: "assistant", content: message },
          ]);
        } else if (data.response) {
          // 检查response中是否包含JSON action
          try {
            const jsonMatch = data.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[0]);
              if (jsonData.action && jsonData.action.type && jsonData.action.data) {
                await handleStructuredAction(jsonData.action.type, jsonData.action.data);
                setShowUndoPrompt(true);
                
                const message = "✅ AI已根据您的指令进行了修改。请确认是否保留。";
                setMessages((m) => [
                  ...m,
                  { role: "assistant", content: message },
                ]);
                return;
              }
            }
          } catch (e) {
            // JSON解析失败，继续正常处理
          }
          
          setMessages((m) => [
            ...m,
            { role: "assistant", content: data.response },
          ]);
          
          // 检查是否是重写请求
          const needsConfirmation = handleRewriteResponse(data.response, [
            ...messages,
            { role: "user", content: msg },
            { role: "assistant", content: data.response }
          ]);
          
          if (needsConfirmation) {
            setShowUndoPrompt(true);
            console.log("✅ 重写完成，显示确认对话框");
          }
        }
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "抱歉，AI服务暂时不可用，请稍后重试。" },
        ]);
      }
    } catch (err) {
      console.error("❌ AI聊天错误:", err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "抱歉，发生了错误，请稍后重试。" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSend };
}
