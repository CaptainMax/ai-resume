"use client";

import { useResumeStore } from "@/app/store/useResumeStore";

import { pointKey } from "@/app/lib/dnd";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PointItemProps = {
  sid: string;
  fid: string;
  pid: string;
  content: string;
};

export default function PointItem({ sid, fid, pid, content }: PointItemProps) {
  const { setSelectedPoint, removePoint } = useResumeStore(); // ✅ 增加 removePoint
   //拖拽
   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: pointKey(sid, fid, pid), // ✅ 用 pointKey 作为唯一拖拽 ID
  });

  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="px-2 py-1 rounded hover:bg-gray-50 flex items-center justify-between group"
      data-id={`point:${sid}:${fid}:${pid}`}
      onClick={(e) => {
        e.stopPropagation(); // 避免冒泡
        setSelectedPoint({ sectionId: sid, fieldId: fid, pointId: pid });
      }}
    >
      {/* 左侧内容 */}
      <span className="flex-1">
        {content || <span className="text-gray-400">（空）</span>}
      </span>

      {/* 删除按钮（hover 时出现） */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // 避免触发选中事件
          removePoint(sid, fid, pid); // ✅ 调用删除函数
        }}
        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-0.5 border border-red-300 rounded text-red-600 hover:bg-red-50 transition"
      >
        ✕
      </button>
      {/* ✅ 拖动手柄（独立控制） */}
      <span
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing select-none text-gray-400 hover:text-gray-600"
            title="拖动以排序"
          >
          ⋮⋮
        </span>
    </li>
  );
}
