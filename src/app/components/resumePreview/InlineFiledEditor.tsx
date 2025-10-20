"use client";

import { useState, useEffect, useRef } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

interface Props {
  sectionId: string;
  fieldId: string;
  value: string;
  isName?: boolean; 
}

export default function InlineFieldEditor({ sectionId, fieldId, value, isName }: Props) {
  const updateFieldValue = useResumeStore((s) => s.updateFieldValue);
  const updateFieldName = useResumeStore((s) => s.updateFieldName);
  const setSelectedField = useResumeStore((s) => s.setSelectedField);
  const setLastModifiedPoint = useResumeStore((s) => s.setLastModifiedPoint);
  const setShowUndoPrompt = useResumeStore((s) => s.setShowUndoPrompt);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      setVal(value);
      prev.current = value;
    }
  }, [value]);

  const save = () => {
    if (val !== value) {
      // 保存原始内容用于undo
      setLastModifiedPoint({
        sectionId,
        fieldId,
        pointId: fieldId, // 使用fieldId作为pointId
        originalContent: value
      });
      
      // 应用修改
      if (isName) {
        updateFieldName(sectionId, fieldId, val); 
      } else {
        updateFieldValue(sectionId, fieldId, val); 
      }
      
      // 显示确认对话框
      setShowUndoPrompt(true);
    }
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        className="cursor-text whitespace-pre-wrap text-sm leading-6 hover:bg-blue-50 rounded px-1"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // 单击：选择字段
          setSelectedField({ sectionId, fieldId });
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // 双击：编辑字段
          setEditing(true);
        }}
      >
        {val || <span className="text-gray-400">（点击选择，双击编辑）</span>}
      </div>
    );
  }

  return (
    <input
      className="w-full rounded border p-1 text-sm leading-6 outline-none focus:ring-2 focus:ring-indigo-400"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") {
          setVal(value);
          setEditing(false);
        }
      }}
      autoFocus
    />
  );
}
