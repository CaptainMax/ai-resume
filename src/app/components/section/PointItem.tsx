"use client";

import { useResumeStore } from "@/app/store/useResumeStore";

type PointItemProps = {
  sid: string;
  fid: string;
  pid: string;
  content: string;
};

export default function PointItem({ sid, fid, pid, content }: PointItemProps) {
  const { setSelectedPoint } = useResumeStore();

  return (
    <li
      className="px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
      data-id={`point:${sid}:${fid}:${pid}`}
      onClick={(e) => {
        e.stopPropagation(); // ✅ 避免冒泡到 FieldItem
        // console.log("点击 Point:", pid);
        setSelectedPoint({ sectionId: sid, fieldId: fid, pointId: pid });
      }}
    >
      {content || <span className="text-gray-400">（空）</span>}
    </li>
  );
}
