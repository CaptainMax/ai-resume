"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import PointItem from "./PointItem";
import { ResumePoint } from "@/app/store/types";

import { fieldKey } from "@/app/lib/dnd";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type FieldItemProps = {
  sid: string;
  fid: string;
  name: string;
  value?: string;
  points?: (ResumePoint | string)[]; // ✅ 支持 string
};

export default function FieldItem({ sid, fid, name, value, points }: FieldItemProps) {
  // ✅ 拖拽
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: fieldKey(sid, fid),
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const { addPoint, removeField, setSelectedField, setSelectedPoint, collapsedFields, toggleField } = useResumeStore();
  
  // ✅ 检查当前field是否折叠
  const fieldCollapseKey = `${sid}-${fid}`;
  const isCollapsed = collapsedFields[fieldCollapseKey] || false;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="border rounded p-2 bg-white shadow-sm text-sm cursor-pointer"
      data-id={`field:${sid}:${fid}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedField({ sectionId: sid, fieldId: fid });
        setSelectedPoint(null);
      }}
    >
      {/* 标题 + 操作按钮 */}
      <div className="flex items-center justify-between font-medium">
        <div className="flex items-center space-x-2">
          {/* ✅ 折叠/展开按钮 */}
          {points && points.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleField(fieldCollapseKey);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
              title={isCollapsed ? "展开" : "折叠"}
            >
              {isCollapsed ? "▶" : "▼"}
            </button>
          )}
          
          <input
            className="text-sm text-gray-800 border-b border-dashed focus:outline-none focus:border-blue-400"
            value={name || ""}
            onChange={(e) => {
              e.stopPropagation();
              useResumeStore.getState().updateFieldName(sid, fid, e.target.value);
            }}
          />
        </div>
        
        <div className="space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addPoint(sid, fid, {
                id: crypto.randomUUID().slice(0, 8),
                content: "New point",
              });
            }}
            className="text-xs px-2 py-0.5 border rounded hover:bg-gray-50"
          >
            + Point
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              removeField(sid, fid);
            }}
            className="text-xs px-2 py-0.5 border rounded text-red-600 hover:bg-red-50"
          >
            ✕
          </button>

          {/* ✅ 拖动手柄 */}
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing select-none text-gray-400 hover:text-gray-600"
            title="拖动以排序"
          >
            ⋮⋮
          </span>
        </div>
      </div>

      {/* ✅ 兼容 AI 输出（string / object 均可） */}
      {points && points.length > 0 && !isCollapsed && (
        <ul className="mt-1 space-y-1">
          {points.map((p, i) => {
            const pointId = typeof p === "string" ? `${fid}-point-${i}` : p.id;
            const pointContent = typeof p === "string" ? p : p.content;

            return (
              <PointItem
                key={pointId}
                sid={sid}
                fid={fid}
                pid={pointId}
                content={pointContent}
              />
            );
          })}
        </ul>
      )}
    </li>
  );
}
