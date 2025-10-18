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
      selectedId: null,
      selectedField: null,
      selectedPoint: null,
    }),
    }
);
