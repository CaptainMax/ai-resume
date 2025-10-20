"use client";
import { useMemo, useState, useEffect } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import AddSectionForm from "./AddSectionForm";
import SectionItem from "./SectionItem";
import FieldItem from "@/app/components/section/FieldItem";
import PointItem from "@/app/components/section/PointItem"; // ✅ 加入 point 的展示组件
import { createPortal } from "react-dom";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { fieldKey, parseDragKey, sectionKey } from "@/app/lib/dnd";

export default function SectionList() {
  const [mounted, setMounted] = useState(false);
  const [activePoint, setActivePoint] = useState<any>(null); // ✅ 当前拖拽点
  useEffect(() => setMounted(true), []);

  const { sections, reorderSections, reorderFields, collapsed, setAllCollapsed, setAllFieldsCollapsed } =
    useResumeStore();

  const sectionItems = useMemo(() => sections.map((s) => sectionKey(s.id)), [sections]);

  // ✅ 拖拽开始时捕捉当前被拖动的 point
  const onDragStart = (e: DragStartEvent) => {
    const a = parseDragKey(String(e.active.id));
    if (a?.kind === "point") {
      const section = sections.find((s) => s.id === a.sectionId);
      const field = section?.fields.find((f) => f.id === a.fieldId);
      const point = field?.points?.find((p) => p.id === a.pointId);
      if (point) setActivePoint({ ...a, content: point.content });
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActivePoint(null); // ✅ 清除 Overlay

    const { active, over } = e;
    if (!over) return;
    const a = parseDragKey(String(active.id));
    const b = parseDragKey(String(over.id));
    if (!a || !b) return;

    // 🟦 Section 拖拽
    if (a.kind === "section" && b.kind === "section") {
      const from = sections.findIndex((s) => s.id === a.sectionId);
      const to = sections.findIndex((s) => s.id === b.sectionId);
      if (from !== -1 && to !== -1 && from !== to) reorderSections(from, to);
      return;
    }

    // 🟨 Field 拖拽
    if (a.kind === "field" && b.kind === "field") {
      const fromSection = sections.find((s) => s.id === a.sectionId);
      const toSection = sections.find((s) => s.id === b.sectionId);
      if (!fromSection || !toSection) return;

      const fromIndex = fromSection.fields.findIndex((f) => f.id === a.fieldId);
      const toIndex = toSection.fields.findIndex((f) => f.id === b.fieldId);
      if (fromIndex === -1 || toIndex === -1) return;

      if (a.sectionId === b.sectionId) {
        reorderFields(a.sectionId, fromIndex, toIndex);
      } else {
        const movedField = fromSection.fields[fromIndex];
        const newSections = sections.map((s) => {
          if (s.id === a.sectionId) {
            const updatedFields = [...s.fields];
            updatedFields.splice(fromIndex, 1);
            return { ...s, fields: updatedFields };
          }
          if (s.id === b.sectionId) {
            const updatedFields = [...s.fields];
            updatedFields.splice(toIndex, 0, movedField);
            return { ...s, fields: updatedFields };
          }
          return s;
        });

        useResumeStore.setState({ sections: newSections });
      }
    }

    // 🟪 Point 拖拽
    if (a.kind === "point" && b.kind === "point") {
      const section = sections.find((s) => s.id === a.sectionId);
      if (!section) return;
      const field = section.fields.find((f) => f.id === a.fieldId);
      if (!field || !field.points) return;

      const from = field.points.findIndex((p) => p.id === a.pointId);
      const to = field.points.findIndex((p) => p.id === b.pointId);

      if (from !== -1 && to !== -1 && from !== to) {
        useResumeStore.getState().reorderPoints(a.sectionId, a.fieldId, from, to);
      }
      return;
    }
  };

  return (
    <aside className="w-1/5 bg-gray-100 border-r p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold">分区列表</h2>
        {/* 隐藏折叠/展开按钮 */}
        {/* <div className="space-x-1">
          <button
            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() => setAllCollapsed(true)}
          >
            折叠Section
          </button>
          <button
            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() => setAllCollapsed(false)}
          >
            展开Section
          </button>
          <button
            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() => setAllFieldsCollapsed(true)}
          >
            折叠Field
          </button>
          <button
            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() => setAllFieldsCollapsed(false)}
          >
            展开Field
          </button>
        </div> */}
      </div>

      <AddSectionForm />

      {mounted ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={sectionItems} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3">
            {sections.map((s, index) => {
              const isCollapsed = !!collapsed[s.id];
              return (
                <li key={`${s.title}-${index}`} className="space-y-2">
                  <SectionItem id={s.id || `${s.title}-${index}`} title={s.title} />


                    {!isCollapsed && (
                      <SortableContext
                        items={(s.fields ?? []).map((f) => fieldKey(s.id, f.id))}
                        strategy={verticalListSortingStrategy}
                      >
                        <ul className="space-y-1 pl-4">
                        {(s.fields ?? []).map((f, i) => (
                        <FieldItem
                          key={`${f.name || "field"}-${i}`}
                          sid={s.id}
                          fid={f.id || `${f.name}-${i}`}
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

          {/* ✅ 拖动时的悬浮视觉层 */}
          {createPortal(
            <DragOverlay>
              {activePoint ? (
                <div className="pointer-events-none opacity-90 scale-105 shadow-lg bg-white rounded">
                  <PointItem
                    sid={activePoint.sectionId}
                    fid={activePoint.fieldId}
                    pid={activePoint.pointId}
                    content={activePoint.content}
                  />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      ) : null}
    </aside>
  );
}
