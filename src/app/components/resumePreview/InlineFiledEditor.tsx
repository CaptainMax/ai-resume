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
      if (isName) {
        updateFieldName(sectionId, fieldId, val); 
      } else {
        updateFieldValue(sectionId, fieldId, val); 
      }
    }
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        className="cursor-text whitespace-pre-wrap text-sm leading-6"
        onClick={() => setEditing(true)}
      >
        {val || <span className="text-gray-400">（点击编辑字段）</span>}
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
