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
    lastModifiedPoint,
    aiModifiedPoints,
    aiOriginalContents,
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

    // 检查是否是AI修改的内容
    const isAiModified = aiModifiedPoints.has(pointId);
    
    // 获取原始内容（如果有的话）
    const originalContent = aiOriginalContents[pointId] || null;

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">编辑 Point</div>
        
        {/* 显示修改前的内容（如果有的话） */}
        {originalContent && originalContent !== point.content && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium">修改前：</div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-800 line-through">
              {originalContent}
            </div>
          </div>
        )}
        
        {/* 显示修改后的内容 */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">
            修改后：
            {isAiModified && <span className="ml-2 text-yellow-600">✨ AI修改</span>}
          </div>
          <textarea
            className={`w-full border rounded-lg px-3 py-3 text-sm min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
              isAiModified ? 'bg-yellow-50 border-yellow-300' : ''
            }`}
            value={point.content ?? ""}
            placeholder="请输入 point 内容..."
            onChange={(e) =>
              updatePoint(sectionId, fieldId, pointId, e.target.value)
            }
          />
        </div>
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
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">编辑 Field</div>

        {/* 显示当前field信息 */}
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-2">当前字段：</div>
          <div className="text-sm text-gray-800 font-medium">{field.name || "（未命名）"}</div>
          {field.points && field.points.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              包含 {field.points.length} 个条目
            </div>
          )}
        </div>

        {/* Field 名称编辑 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">字段名称：</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={field.name ?? ""}
            placeholder="请输入字段名称"
            onChange={(e) => updateFieldName(sectionId, fieldId, e.target.value)}
          />
        </div>
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

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">编辑 Section</div>
        
        {/* 显示当前section信息 */}
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-2">当前分区：</div>
          <div className="text-sm text-gray-800 font-medium">{section.title || "（未命名）"}</div>
          {section.fields && section.fields.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              包含 {section.fields.length} 个字段
            </div>
          )}
        </div>

        {/* Section 标题编辑 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">分区标题：</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={section.title ?? ""}
            placeholder="请输入 section 标题"
            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
          />
        </div>
      </div>
    );
  }

  return null;
}
