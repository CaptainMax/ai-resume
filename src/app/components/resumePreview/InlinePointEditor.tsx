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
      updatePoint(sectionId, fieldId, pointId, val);
    }
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        className="cursor-text whitespace-pre-wrap text-sm leading-6"
        onClick={() => setEditing(true)}
      >
        {val || <span className="text-gray-400">（点击编辑条目）</span>}
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
