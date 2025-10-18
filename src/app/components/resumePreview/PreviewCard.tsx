"use client";

import { forwardRef } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { sectionKey } from "@/app/lib/dnd";

type Props = {
  id: string;
  title: string;
  children: React.ReactNode;
  highlighted?: boolean;
};

const PreviewCard = forwardRef<HTMLDivElement, Props>(function PreviewCard(
  { id, title, children, highlighted },
  externalRef
) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: sectionKey(id),
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const { removeSection } = useResumeStore();

  // ✅ 合并 ref：把 dnd-kit 的 setNodeRef 与父组件传入的 externalRef 合并，
  // 并且确保签名是 (node: HTMLDivElement | null) => void，满足 <div ref=...> 的类型。
  const combinedRef = (node: HTMLDivElement | null) => {
    // dnd-kit 接受 HTMLElement|null，HTMLDivElement 是其子类型，OK
    setNodeRef(node as unknown as HTMLElement | null);

    if (typeof externalRef === "function") {
      externalRef(node);
    } else if (externalRef) {
      (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 border rounded bg-white shadow-sm cursor-move transition
                  ${highlighted ? "ring-2 ring-blue-500 shadow-md" : ""}`}
      aria-label={`Section ${title}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSection(id);
          }}
          className="text-xs px-2 py-0.5 border rounded hover:bg-red-50 text-red-600"
          aria-label="Delete section"
        >
          Delete Section
        </button>
      </div>
      {children}
    </div>
  );
});

export default PreviewCard;
