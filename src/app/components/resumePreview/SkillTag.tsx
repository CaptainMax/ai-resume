"use client";

import { useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";

interface SkillTagProps {
  sectionId: string;
  fieldId: string;
  pointId: string;
  content: string;
}

export default function SkillTag({ sectionId, fieldId, pointId, content }: SkillTagProps) {
  const [isHovered, setIsHovered] = useState(false);
  const removePoint = useResumeStore((s) => s.removePoint);
  const setLastDeletedPoint = useResumeStore((s) => s.setLastDeletedPoint);
  const setShowUndoPrompt = useResumeStore((s) => s.setShowUndoPrompt);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 记录被删除的point信息，用于undo
    setLastDeletedPoint({
      sectionId,
      fieldId,
      pointId,
      point: { id: pointId, content }
    });
    
    // 删除point
    removePoint(sectionId, fieldId, pointId);
    
    // 显示undo提示
    setShowUndoPrompt(true);
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm text-blue-800 hover:bg-blue-100 transition-colors">
        {content}
      </div>
      
      {/* 删除按钮 - 只在悬停时显示 */}
      {isHovered && (
        <button
          onClick={handleDelete}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
          title="删除技能"
        >
          ×
        </button>
      )}
    </div>
  );
}
