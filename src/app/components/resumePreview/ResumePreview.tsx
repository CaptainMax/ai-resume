"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import PreviewCard from "./PreviewCard";
import InlineFieldEditor from "./InlineFiledEditor";
import InlinePointEditor from "./InlinePointEditor";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { sectionKey, parseDragKey } from "@/app/lib/dnd";

export default function ResumePreview() {
  const { sections, reorderSections, selectedId } = useResumeStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useMemo(() => sections.map((s) => sectionKey(s.id)), [sections]);

  // refs: Section
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  // Section 高亮
  const [flashSection, setFlashSection] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId) return;
    const el = sectionRefs.current[selectedId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashSection(selectedId);
    const t = setTimeout(() => setFlashSection(null), 1500);
    return () => clearTimeout(t);
  }, [selectedId]);

  // Section 拖拽排序
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
    }
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">简历预览</h1>

      {mounted ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sections.map((s) => (
                <PreviewCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  highlighted={flashSection === s.id}
                  ref={setSectionRef(s.id)}
                >
                  <div className="space-y-2">
                    {(s.fields ?? []).map((f) => (
                      <div key={f.id} className="pl-2">
                        {/* 单值字段 */}
                        {/* {f.value !== undefined && (
                          <InlineFieldEditor
                            sectionId={s.id}
                            fieldId={f.id}
                            value={f.value}
                            isName={true}
                          />
                        )} */}
                        {/* 渲染字段名称 */}
                        {f.name && (
                          <div className="font-medium text-gray-800">
                            <InlineFieldEditor
                              sectionId={s.id}
                              fieldId={f.id}
                              value={f.name}
                              isName={true} // ✅ 编辑 name，而不是 value
                            />
                          </div>
                        )}

                        {/* 渲染字段内容（value） */}
                        {f.value && (
                          <div className="text-gray-700">
                            <InlineFieldEditor
                              sectionId={s.id}
                              fieldId={f.id}
                              value={f.value}
                              isName={false} // ✅ 编辑 value
                            />
                          </div>
                        )}

                        {/* 点状字段 */}
                        {f.points && f.points.length > 0 && (
                          <ul className="list-disc pl-5 text-gray-700 space-y-1">
                            {f.points.map((p) => (
                              <li key={p.id}>
                                <InlinePointEditor
                                  sectionId={s.id}
                                  fieldId={f.id}
                                  pointId={p.id}
                                  content={p.content}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </PreviewCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">
          <div className="h-24 bg-white border rounded animate-pulse" />
          <div className="h-24 bg-white border rounded animate-pulse" />
        </div>
      )}
    </main>
  );
}
