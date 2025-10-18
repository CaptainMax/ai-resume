// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useResumeStore } from "@/app/store/useResumeStore";

// interface Props {
//   sectionId: string;
//   blockId: string;
//   content: string;
// }

// export default function InlineBlockEditor({ sectionId, blockId, content }: Props) {
//   const updateBlockContent = useResumeStore((s) => s.updateBlockContent);
//   const [editing, setEditing] = useState(false);
//   const [val, setVal] = useState(content);
//   const prevContent = useRef(content);

//   // 只有当 content 真变化时才同步到本地 state，避免死循环
//   useEffect(() => {
//     if (content !== prevContent.current) {
//       setVal(content);
//       prevContent.current = content;
//     }
//   }, [content]);

//   const save = () => {
//     if (val !== content) {
//       updateBlockContent(sectionId, blockId, val);
//     }
//     setEditing(false);
//   };

//   if (!editing) {
//     return (
//       <div
//         className="cursor-text whitespace-pre-wrap text-sm leading-6"
//         onClick={() => setEditing(true)}
//       >
//         {val || <span className="text-gray-400">（点击编辑条目）</span>}
//       </div>
//     );
//   }

//   return (
//     <textarea
//       className="w-full rounded border p-1 text-sm leading-6 outline-none focus:ring-2 focus:ring-indigo-400"
//       rows={2}
//       value={val}
//       onChange={(e) => setVal(e.target.value)}
//       onBlur={save}
//       onKeyDown={(e) => {
//         if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
//           e.preventDefault();
//           save();
//         }
//         if (e.key === "Escape") {
//           setVal(content);
//           setEditing(false);
//         }
//       }}
//       autoFocus
//     />
//   );
// }
