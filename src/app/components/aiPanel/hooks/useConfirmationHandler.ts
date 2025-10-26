// src/app/components/aiPanel/hooks/useConfirmationHandler.ts
"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useLanguageDetection } from "./useLanguageDetection";
import { useFeedbackCollection } from "./useFeedbackCollection";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function useConfirmationHandler() {
  const { 
    sections, 
    lastAddedFieldId, 
    setLastAddedFieldId, 
    lastAddedPointId, 
    setLastAddedPointId, 
    lastModifiedPoint, 
    setLastModifiedPoint, 
    lastDeletedPoint,
    setLastDeletedPoint,
    removeField, 
    removePoint,
    addPoint,
    updatePoint,
    removeAiModifiedPoint,
    removeAiOriginalContent
  } = useResumeStore();
  
  const { shouldUseEnglish } = useLanguageDetection();
  const { recordFieldEdit, recordPointEdit, recordPointAdd } = useFeedbackCollection();

  // 用户确认保留AI生成的修改
  const handleConfirmKeep = (messages: ChatMsg[], setMessages: (fn: (m: ChatMsg[]) => ChatMsg[]) => void) => {
    // 🧠 记录反馈：用户确认保留AI修改
    if (lastModifiedPoint) {
      const { sectionId, fieldId, pointId, originalContent } = lastModifiedPoint;
      // 获取当前内容作为新内容
      const field = sections.find(s => s.id === sectionId)?.fields.find(f => f.id === fieldId);
      const point = field?.points?.find(p => p.id === pointId);
      if (point) {
        recordPointEdit(sectionId, fieldId, pointId, originalContent, point.content);
      }
    }
    
    if (lastAddedPointId) {
      // 记录新添加的point
      for (const section of sections) {
        for (const field of section.fields) {
          const point = field.points?.find(p => p.id === lastAddedPointId);
          if (point) {
            recordPointAdd(section.id, field.id, lastAddedPointId, point.content);
            break;
          }
        }
      }
    }
    
    setLastAddedFieldId(null); // 清除最后添加的field ID
    setLastAddedPointId(null); // 清除最后添加的point ID
    setLastModifiedPoint(null); // 清除最后修改的point信息
    
    const useEnglish = shouldUseEnglish(messages);
    const message = useEnglish 
      ? "👍 AI-generated changes have been kept." 
      : "👍 已保留AI生成的修改。";
    setMessages((m) => [
      ...m,
      { role: "assistant", content: message },
    ]);
  };

  // 用户选择撤销AI生成的修改
  const handleUndoLastAction = (messages: ChatMsg[], setMessages: (fn: (m: ChatMsg[]) => ChatMsg[]) => void) => {
    const useEnglish = shouldUseEnglish(messages);
    
    // 处理撤销添加的field
    if (lastAddedFieldId) {
      // 找到对应的sectionId
      let sectionIdToRemoveFrom: string | null = null;
      for (const section of sections) {
        if (section.fields.some(field => field.id === lastAddedFieldId)) {
          sectionIdToRemoveFrom = section.id;
          break;
        }
      }

      if (sectionIdToRemoveFrom) {
        removeField(sectionIdToRemoveFrom, lastAddedFieldId);
        const message = useEnglish
          ? "↩️ AI-generated field has been removed."
          : "↩️ 已撤销AI生成的field。";
        setMessages((m) => [
          ...m,
          { role: "assistant", content: message },
        ]);
      }
    }
    
    // 处理撤销添加的point
    if (lastAddedPointId) {
      // 找到对应的sectionId和fieldId
      let sectionIdToRemoveFrom: string | null = null;
      let fieldIdToRemoveFrom: string | null = null;
      
      for (const section of sections) {
        for (const field of section.fields) {
          if (field.points?.some(point => point.id === lastAddedPointId)) {
            sectionIdToRemoveFrom = section.id;
            fieldIdToRemoveFrom = field.id;
            break;
          }
        }
        if (sectionIdToRemoveFrom) break;
      }

      if (sectionIdToRemoveFrom && fieldIdToRemoveFrom) {
        removePoint(sectionIdToRemoveFrom, fieldIdToRemoveFrom, lastAddedPointId);
        removeAiModifiedPoint(lastAddedPointId); // 清除AI修改标记
        removeAiOriginalContent(lastAddedPointId); // 清除原始内容
        const message = useEnglish
          ? "↩️ AI-generated point has been removed."
          : "↩️ 已撤销AI生成的point。";
        setMessages((m) => [
          ...m,
          { role: "assistant", content: message },
        ]);
      }
    }
    
    // 处理撤销修改的point
    if (lastModifiedPoint) {
      const { sectionId, fieldId, pointId, originalContent } = lastModifiedPoint;
      updatePoint(sectionId, fieldId, pointId, originalContent);
      removeAiModifiedPoint(pointId); // 清除AI修改标记
      removeAiOriginalContent(pointId); // 清除原始内容
      const message = useEnglish
        ? "↩️ AI-generated changes have been undone."
        : "↩️ 已撤销AI生成的修改。";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: message },
      ]);
    }
    
    // 处理撤销删除的point
    if (lastDeletedPoint) {
      const { sectionId, fieldId, pointId, point } = lastDeletedPoint;
      addPoint(sectionId, fieldId, point);
      const message = useEnglish
        ? "↩️ Deleted point has been restored."
        : "↩️ 已恢复被删除的内容。";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: message },
      ]);
    }
    
    setLastAddedFieldId(null); // 清除最后添加的field ID
    setLastAddedPointId(null); // 清除最后添加的point ID
    setLastModifiedPoint(null); // 清除最后修改的point信息
    setLastDeletedPoint(null); // 清除最后删除的point信息
  };

  return { handleConfirmKeep, handleUndoLastAction };
}
