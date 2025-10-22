import { SliceCreator } from "../types";
import { UiSlice } from "../types";
import { initialSections } from "../initial";

export const createUiSlice: SliceCreator<UiSlice> = (set, get) => ({
  collapsed: {},
  toggleSection: (sectionId) =>
    set((state) => ({
      collapsed: { ...state.collapsed, [sectionId]: !state.collapsed[sectionId] },
    })),
  setAllCollapsed: (flag) =>
    set((state) => {
      const next: Record<string, boolean> = {};
      state.sections.forEach((s) => (next[s.id] = flag));
      return { collapsed: next };
    }),

  // ✅ 新增：Field 折叠状态
  collapsedFields: {},
  toggleField: (fieldKey) =>
    set((state) => ({
      collapsedFields: { ...state.collapsedFields, [fieldKey]: !state.collapsedFields[fieldKey] },
    })),
  setAllFieldsCollapsed: (flag) =>
    set((state) => {
      const next: Record<string, boolean> = {};
      state.sections.forEach((section) => {
        section.fields.forEach((field) => {
          const fieldKey = `${section.id}-${field.id}`;
          next[fieldKey] = flag;
        });
      });
      return { collapsedFields: next };
    }),

  selectedId: null,
  setSelected: (id) => set({ selectedId: id }),

  // ✅ 新增：选中的 Field
  selectedField: null,
  setSelectedField: (sel) => set({ selectedField: sel }),

  // ✅ 新增：选中的 Point
  selectedPoint: null,
  setSelectedPoint: (sel) => set({ selectedPoint: sel }),

        reset: () =>
          set({
          //   sections: initialSections,
            collapsed: {},
            collapsedFields: {},
            selectedId: null,
            selectedField: null,
            selectedPoint: null,
            lastAddedFieldId: null,
            lastAddedPointId: null,
            lastModifiedPoint: null,
            aiModifiedPoints: new Set<string>(),
            aiOriginalContents: {},
            showUndoPrompt: false,
          }),

  lastAddedFieldId: null,
  setLastAddedFieldId: (id) => set({ lastAddedFieldId: id }),

  lastModifiedPoint: null,
  setLastModifiedPoint: (point) => set({ lastModifiedPoint: point }),

  lastAddedPointId: null,
  setLastAddedPointId: (id) => set({ lastAddedPointId: id }),
  
  // AI修改高亮状态
  aiModifiedPoints: new Set<string>(),
  addAiModifiedPoint: (pointId) => 
    set((state) => ({
      aiModifiedPoints: new Set([...state.aiModifiedPoints, pointId])
    })),
  removeAiModifiedPoint: (pointId) =>
    set((state) => {
      const newSet = new Set(state.aiModifiedPoints);
      newSet.delete(pointId);
      return { aiModifiedPoints: newSet };
    }),
  clearAiModifiedPoints: () => set({ aiModifiedPoints: new Set<string>() }),
  
  // AI修改的原始内容
  aiOriginalContents: {},
  setAiOriginalContent: (pointId, originalContent) =>
    set((state) => ({
      aiOriginalContents: { ...state.aiOriginalContents, [pointId]: originalContent }
    })),
  removeAiOriginalContent: (pointId) =>
    set((state) => {
      const newContents = { ...state.aiOriginalContents };
      delete newContents[pointId];
      return { aiOriginalContents: newContents };
    }),
    
  // 撤销提示状态
  showUndoPrompt: false,
  setShowUndoPrompt: (show) => set({ showUndoPrompt: show }),
    }
);
