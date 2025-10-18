// import { SliceCreator } from "../types";
// import { BlocksSlice } from "../types";

// export const createBlocksSlice: SliceCreator<BlocksSlice> = (set, get) => ({
//   reorderBlocks: (sectionId, oldIndex, newIndex) =>
//     set((state) => ({
//       sections: state.sections.map((s) => {
//         if (s.id !== sectionId) return s;
//         const blocks = [...s.blocks];
//         const [moved] = blocks.splice(oldIndex, 1);
//         blocks.splice(newIndex, 0, moved);
//         return { ...s, blocks };
//       }),
//     })),

//   addBlock: (sectionId, block) =>
//     set((state) => ({
//       sections: state.sections.map((s) =>
//         s.id === sectionId ? { ...s, blocks: [...s.blocks, block] } : s
//       ),
//     })),

//   removeBlock: (sectionId, blockId) =>
//     set((state) => ({
//       sections: state.sections.map((s) =>
//         s.id === sectionId ? { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) } : s
//       ),
//     })),

//   updateBlockContent: (sectionId, blockId, content) =>
//     set((state) => ({
//       sections: state.sections.map((s) =>
//         s.id !== sectionId
//           ? s
//           : {
//               ...s,
//               blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, content } : b)),
//             }
//       ),
//     })),
// });
