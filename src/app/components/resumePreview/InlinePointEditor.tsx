"use client";

import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

interface Props {
  sectionId: string;
  fieldId: string;
  pointId: string;
  content: string;
}

export default function InlinePointEditor({ sectionId, fieldId, pointId, content }: Props) {
  const updatePoint = useResumeStore((s) => s.updatePoint);
  const setSelectedPoint = useResumeStore((s) => s.setSelectedPoint);
  const setLastModifiedPoint = useResumeStore((s) => s.setLastModifiedPoint);
  const setShowUndoPrompt = useResumeStore((s) => s.setShowUndoPrompt);
  const aiModifiedPoints = useResumeStore((s) => s.aiModifiedPoints);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(content);
  const prevContent = useRef(content);

  // 当 content 外部更新时同步
  useEffect(() => {
    if (content !== prevContent.current) {
      setVal(content);
      prevContent.current = content;
    }
  }, [content]);

  const save = () => {
    if (val !== content) {
      // 保存原始内容用于undo
      setLastModifiedPoint({
        sectionId,
        fieldId,
        pointId,
        originalContent: content
      });
      
      // 应用修改
      updatePoint(sectionId, fieldId, pointId, val);
      
      // 显示确认对话框
      setShowUndoPrompt(true);
    }
    setEditing(false);
  };

  const isAiModified = aiModifiedPoints.has(pointId);

  if (!editing) {
    return (
      <div
        className={`cursor-text whitespace-pre-wrap text-sm leading-6 hover:bg-blue-50 rounded px-1 transition-colors ${
          isAiModified 
            ? "bg-yellow-100 border-l-4 border-yellow-400 pl-2 shadow-sm" 
            : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // 单击：选择点
          setSelectedPoint({ sectionId, fieldId, pointId });
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // 双击：直接编辑
          setEditing(true);
        }}
      >
        {val || <span className="text-gray-400">（点击选择，双击编辑）</span>}
        {isAiModified && (
          <span className="ml-2 text-xs text-yellow-600 font-medium">✨ AI修改</span>
        )}
      </div>
    );
  }

  return (
    <textarea
      className="w-full rounded border p-1 text-sm leading-6 outline-none focus:ring-2 focus:ring-indigo-400"
      rows={2}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          save();
        }
        if (e.key === "Escape") {
          setVal(content);
          setEditing(false);
        }
      }}
      autoFocus
    />
  );
}
