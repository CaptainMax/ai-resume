"use client";

import { useResumeStore } from "@/app/store/useResumeStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { blockKey } from "@/app/lib/dnd";

export default function BlockItem({
  sid,
  bid,
  content,
}: {
  sid: string;
  bid: string;
  content: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: blockKey(sid, bid),
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const { removeBlock, selectedBlock, setSelectedBlock } = useResumeStore();
  const active = selectedBlock?.sectionId === sid && selectedBlock?.blockId === bid;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between px-2 py-1 rounded border bg-gray-50
                  ${active ? "ring-2 ring-blue-500 bg-white" : ""}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* 点击文本 = 选中（联动中间预览滚动/高亮） */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBlock({ sectionId: sid, blockId: bid });
          }}
          className="flex-1 text-left text-sm text-gray-700 truncate"
          title={content}
        >
          {content}
        </button>

        {/* 拖拽把手（避免点击文本误拖拽） */}
        <span
          {...attributes}
          {...listeners}
          className="inline-flex cursor-grab select-none text-gray-400 px-1"
          aria-label="Drag block"
          title="Drag to reorder"
        >
          ⋮⋮
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          removeBlock(sid, bid);
        }}
        className="ml-2 text-xs px-2 py-0.5 border rounded hover:bg-red-50 text-red-600"
        title="Delete block"
      >
        Delete
      </button>
    </li>
  );
}
