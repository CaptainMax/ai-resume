"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import PointItem from "./PointItem";
import { ResumePoint } from "@/app/store/types";

type FieldItemProps = {
  sid: string;
  fid: string;
  name: string;
  value?: string;
  points?: ResumePoint[];
};

export default function FieldItem({ sid, fid, name, value, points }: FieldItemProps) {
  const { addPoint, removeField, setSelectedField, setSelectedPoint } = useResumeStore();

  return (
    <li
      className="border rounded p-2 bg-white shadow-sm text-sm cursor-pointer"
      data-id={`field:${sid}:${fid}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedField({ sectionId: sid, fieldId: fid });
        setSelectedPoint(null); // 清空 point 选中
      }}
    >
      {/* 标题 + 操作按钮 */}
  <div className="flex items-center justify-between font-medium">
  {value && <span className="block text-sm text-gray-600">{value}</span>}
  <div className="space-x-2">
    {/* + Point 按钮 */}
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

    {/* 删除 Field 按钮 */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        removeField(sid, fid);
      }}
      className="text-xs px-2 py-0.5 border rounded text-red-600 hover:bg-red-50"
    >
      ✕
    </button>
  </div>
  </div>

{/* 单值字段 (只展示，不要 name 重复) */}


{/* 点状条目 */}
{points && points.length > 0 && (
  <ul className="mt-1 space-y-1">
    {points.map((p) => (
      <PointItem
        key={p.id}
        sid={sid}
        fid={fid}
        pid={p.id}
        content={p.content}
      />
    ))}
  </ul>
)}

      {/* 展示 Field value（不可直接编辑） */}
      {value && <div className="mt-1 text-gray-600">{value}</div>}

      {/* 点状条目 */}
      {points && points.length > 0 && (
        <ul className="mt-1 space-y-1">
          {points.map((p) => (
            <PointItem
              key={p.id}
              sid={sid}
              fid={fid}
              pid={p.id}
              content={p.content}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
