"use client";

import { useResumeStore } from "@/app/store/useResumeStore";

export default function SelectionEditor() {
  const {
    sections,
    selectedId,
    selectedField,
    selectedPoint,
    updateSectionTitle,
    updateFieldValue,
    updateFieldName,
    updatePoint,
    removePoint,   
  } = useResumeStore();

  // 没选中任何内容
  if (!selectedId && !selectedField && !selectedPoint) {
    return <div className="text-gray-400">请选择一个 Section / Field / Point</div>;
  }

  // ✅ Point 编辑
  if (selectedPoint) {
    const { sectionId, fieldId, pointId } = selectedPoint;
    const section = sections.find((s) => s.id === sectionId);
    const field = section?.fields.find((f) => f.id === fieldId);
    const point = field?.points?.find((p) => p.id === pointId);
    if (!point) return null;

    console.log("正在编辑 Point:", pointId, point);

    return (
      <div>
        <div className="text-sm font-medium mb-1">编辑 Point</div>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          value={point.content ?? ""}
          placeholder="请输入 point 内容"
          onChange={(e) =>
            updatePoint(sectionId, fieldId, pointId, e.target.value)
          }
        />
      </div>
    );
  }

  // ✅ Field 编辑
  if (selectedField) {
    const { sectionId, fieldId } = selectedField;
    const section = sections.find((s) => s.id === sectionId);
    const field = section?.fields.find((f) => f.id === fieldId);
    if (!field) return null;

    return (
      <div>
        <div className="text-sm font-medium mb-1">编辑 Field</div>

        {/* Field 名称 */}
        <label className="text-xs text-gray-500">字段名称（name）</label>
        <input
          className="w-full border rounded px-2 py-1 text-sm mb-2"
          value={field.name ?? ""}
          placeholder="请输入字段名称"
          onChange={(e) => updateFieldName(sectionId, fieldId, e.target.value)}
        />
      </div>
    );
  }
  
  
  // Point 编辑（加删除按钮）
//   if (selectedPoint) {
//     const { sectionId, fieldId, pointId } = selectedPoint;
//     const section = sections.find((s) => s.id === sectionId);
//     const field = section?.fields.find((f) => f.id === fieldId);
//     const point = field?.points?.find((p) => p.id === pointId);
//     if (!point) return null;
  
//     return (
//       <div>
//         <div className="text-sm font-medium mb-1">编辑 Point</div>
//         <input
//           className="w-full border rounded px-2 py-1 text-sm mb-2"
//           value={point.content}
//           onChange={(e) =>
//             updatePoint(sectionId, fieldId, pointId, e.target.value)
//           }
//         />
//         <button
//           onClick={() => removePoint(sectionId, fieldId, pointId)}
//           className="text-xs px-2 py-1 border rounded text-red-600 hover:bg-red-50"
//         >
//           删除 Point
//         </button>
//       </div>
//     );
//   }
  
  // ✅ Section 编辑
  if (selectedId) {
    const section = sections.find((s) => s.id === selectedId);
    if (!section) return null;

    console.log("正在编辑 Section:", selectedId, section);

    return (
      <div>
        <div className="text-sm font-medium mb-1">编辑 Section 标题</div>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          value={section.title ?? ""}
          placeholder="请输入 section 标题"
          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
        />
      </div>
    );
  }

  return null;
}
