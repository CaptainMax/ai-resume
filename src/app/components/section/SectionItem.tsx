"use client";
import { useResumeStore } from "@/app/store/useResumeStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { sectionKey } from "@/app/lib/dnd";

export default function SectionItem({ id, title }: { id: string; title: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: sectionKey(id),
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // ✅ 从 store 里取 addField，而不是 addBlock
  const { removeSection, addField, collapsed, toggleSection, selectedId, setSelected } =
    useResumeStore();

  const isActive = selectedId === id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 bg-white rounded border shadow-sm`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSection(id);
          }}
          className="w-6 h-6 rounded hover:bg-gray-100"
        >
          <span className="text-xs">{collapsed[id] ? "▶" : "▼"}</span>
        </button>

        {/* 点击标题 -> 选中该 Section（高亮 + 中间联动滚动） */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelected(id);
          }}
          className={`px-1 rounded font-semibold ${
            isActive ? "bg-blue-50 text-blue-700" : ""
          }`}
        >
          {title}
        </button>

        <span
          {...attributes}
          {...listeners}
          className="ml-1 cursor-grab select-none text-gray-400"
        >
          ⋮⋮
        </span>
      </div>

      <div className="space-x-2">
        {/* ✅ 改为新增 Field */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addField(id, {
              id: crypto.randomUUID().slice(0, 8),
              name: "New Field",
              value: "",
              points: [],
            });
          }}
          className="text-sm px-2 py-1 border rounded"
        >
          + Field
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSection(id);
          }}
          className="text-sm px-2 py-1 border rounded text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
