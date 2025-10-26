"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import PreviewCard from "./PreviewCard";
import InlineFieldEditor from "./InlineFiledEditor";
import InlinePointEditor from "./InlinePointEditor";
import SkillTag from "./SkillTag";
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
    <main className="h-full p-4 overflow-y-auto bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">简历预览</h1>

      {mounted ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
            {sections.map((s, i) => (
              <PreviewCard
                key={s.id || `${s.title}-${i}`}
                id={s.id || `${s.title}-${i}`}
                title={s.title}
                highlighted={flashSection === s.id}
                ref={setSectionRef(s.id || `${s.title}-${i}`)}
              >
                <div className="space-y-1">
                  {(s.fields ?? []).map((f, i) => (
                    <div key={f.id || `${s.id}-field-${i}`} className="pl-2">
                      {/* 渲染字段名称和内容 */}
                      {f.name && f.value && f.name === f.value ? (
                        // 如果字段名和值相同，只显示一次
                        <div className="font-medium text-gray-800">
                          <InlineFieldEditor
                            sectionId={s.id}
                            fieldId={f.id}
                            value={f.name}
                            isName={true}
                          />
                        </div>
                      ) : (
                        // 如果字段名和值不同，分别显示
                        <>
                          {f.name && (
                            <div className="font-medium text-gray-800">
                              <InlineFieldEditor
                                sectionId={s.id}
                                fieldId={f.id}
                                value={f.name}
                                isName={true}
                              />
                            </div>
                          )}
                          {f.value && (
                            <div className="text-gray-700">
                              <InlineFieldEditor
                                sectionId={s.id}
                                fieldId={f.id}
                                value={f.value}
                                isName={false}
                              />
                            </div>
                          )}
                        </>
                      )}

                      {/* 点状字段 */}
                      {f.points && f.points.length > 0 && (
                        // 检查是否是Technical Skills section
                        s.title.toLowerCase().includes('technical') || s.title.toLowerCase().includes('skills') ? (
                          // Technical Skills: 美观的标签布局
                          <div className="text-gray-700">
                            <div className="flex flex-wrap gap-2">
                              {f.points.map((p, j) => {
                                const pointContent = typeof p === "string" ? p : p.content;
                                const pointId = typeof p === "string" ? `${f.id}-point-${j}` : p.id;

                                return (
                                  <SkillTag
                                    key={pointId}
                                    sectionId={s.id}
                                    fieldId={f.id}
                                    pointId={pointId}
                                    content={pointContent}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          // 其他section: 竖向列表
                          <ul className="list-disc pl-5 text-gray-700 space-y-1">
                            {f.points.map((p, j) => {
                              const pointContent = typeof p === "string" ? p : p.content;
                              const pointId = typeof p === "string" ? `${f.id}-point-${j}` : p.id;

                              return (
                                <li key={pointId}>
                                  <InlinePointEditor
                                    sectionId={s.id}
                                    fieldId={f.id}
                                    pointId={pointId}
                                    content={pointContent}
                                  />
                                </li>
                              );
                            })}
                          </ul>
                        )
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
