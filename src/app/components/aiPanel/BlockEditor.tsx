// // src/app/components/aiPanel/BlockEditor.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useResumeStore } from "@/app/store/useResumeStore";
// import { useDebouncedCallback } from "@/app/components/hooks/useDebounce";

// export default function BlockEditor() {
//   const sections = useResumeStore((s) => s.sections);

//   const selectedField = useResumeStore((s) => s.selectedField);
//   const selectedPoint = useResumeStore((s) => s.selectedPoint);

//   const updateFieldValue = useResumeStore((s) => s.updateFieldValue);
//   const updatePoint = useResumeStore((s) => s.updatePoint);

//   // 计算当前选中目标 & 初始内容
//   const current = useMemo(() => {
//     if (selectedPoint) {
//       const sec = sections.find((x) => x.id === selectedPoint.sectionId);
//       const fld = sec?.fields.find((f) => f.id === selectedPoint.fieldId);
//       const pt = fld?.points?.find((p) => p.id === selectedPoint.pointId);
//       return pt
//         ? {
//             kind: "point" as const,
//             content: pt.content,
//             sectionId: selectedPoint.sectionId,
//             fieldId: selectedPoint.fieldId,
//             pointId: selectedPoint.pointId,
//             label: "选中条目原文",
//           }
//         : null;
//     }
//     if (selectedField) {
//       const sec = sections.find((x) => x.id === selectedField.sectionId);
//       const fld = sec?.fields.find((f) => f.id === selectedField.fieldId);
//       return fld
//         ? {
//             kind: "field" as const,
//             content: fld.value ?? "",
//             sectionId: selectedField.sectionId,
//             fieldId: selectedField.fieldId,
//             label: "选中字段原文",
//           }
//         : null;
//     }
//     return null;
//   }, [sections, selectedField, selectedPoint]);

//   const [val, setVal] = useState(current?.content ?? "");
//   const prev = useRef(current?.content ?? "");

//   useEffect(() => {
//     const c = current?.content ?? "";
//     setVal(c);
//     prev.current = c;
//   }, [current?.content]);

//   const debouncedSave = useDebouncedCallback((text: string) => {
//     if (!current) return;
//     if (text === prev.current) return;

//     if (current.kind === "field") {
//       updateFieldValue(current.sectionId, current.fieldId, text);
//     } else {
//       updatePoint(current.sectionId, current.fieldId, current.pointId!, text);
//     }
//     prev.current = text;
//   }, 300);

//   if (!current) {
//     return (
//       <div className="text-sm text-gray-400 py-6 text-center">
//         请选择一个字段或条目（在左侧列表或中间预览单击）
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       <div className="text-sm font-semibold">{current.label}</div>
//       <textarea
//         className="w-full rounded border p-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//         rows={5}
//         value={val}
//         onChange={(e) => {
//           const t = e.target.value;
//           setVal(t);
//           debouncedSave(t);
//         }}
//         placeholder="在此编辑选中的内容，失焦或停顿后自动保存…"
//       />
//       <div className="text-xs text-gray-400">
//         提示：支持 Cmd/Ctrl+Enter 在聊天框发送指令；此处修改会同步到预览。
//       </div>
//     </div>
//   );
// }
