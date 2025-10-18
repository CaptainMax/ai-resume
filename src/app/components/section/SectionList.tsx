"use client";
import { useMemo, useState, useEffect } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import AddSectionForm from "./AddSectionForm";
import SectionItem from "./SectionItem";
import FieldItem from "@/app/components/section/FieldItem";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { fieldKey, parseDragKey, sectionKey } from "@/app/lib/dnd";

export default function SectionList() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { sections, reorderSections, collapsed, setAllCollapsed } = useResumeStore();

  const sectionItems = useMemo(() => sections.map((s) => sectionKey(s.id)), [sections]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const a = parseDragKey(String(active.id));
    const b = parseDragKey(String(over.id));
    if (!a || !b) return;

    if (a.kind === "section" && b.kind === "section") {
      const from = sections.findIndex((s) => s.id === a.sectionId);
      const to = sections.findIndex((s) => s.id === b.sectionId);
      if (from !== -1 && to !== -1 && from !== to) reorderSections(from, to);
      return;
    }

    // ⚠️ 如果你未来要加 field 拖拽，就在这里处理 reorderFields
  };

  return (
    <aside className="w-1/5 bg-gray-100 border-r p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold">分区列表</h2>
        <div className="space-x-2">
          <button
            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() => setAllCollapsed(true)}
          >
            全部折叠
          </button>
          <button
            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() => setAllCollapsed(false)}
          >
            全部展开
          </button>
        </div>
      </div>

      <AddSectionForm />

      {mounted ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sectionItems} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3">
              {sections.map((s) => {
                const isCollapsed = !!collapsed[s.id];
                return (
                  <li key={s.id} className="space-y-2">
                    <SectionItem id={s.id} title={s.title} />

                    {!isCollapsed && (
                      <SortableContext
                      items={(s.fields ?? []).map((f) => fieldKey(s.id, f.id))}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul className="space-y-1 pl-4">
                        {(s.fields ?? []).map((f) => (
                          <FieldItem
                            key={f.id}
                            sid={s.id}
                            fid={f.id}
                            name={f.name}
                            value={f.value}
                            points={f.points}
                          />
                        ))}
                      </ul>
                    </SortableContext>
                    
                    )}
                  </li>
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}
    </aside>
  );
}
