import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { ResumeState } from "./types";
import { createSectionsSlice } from "./slices/sections";
// import { createBlocksSlice } from "./slices/blocks";
import { createUiSlice } from "./slices/ui";

/** 组合所有 slice，并配置 persist */
export const useResumeStore = create<ResumeState>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...createSectionsSlice(set, get, api),
        // ...createBlocksSlice(set, get, api),
        ...createUiSlice(set, get, api),
      }),
      {
        name: "airesume_store_v2",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sections: state.sections,
          collapsed: state.collapsed,
          collapsedFields: state.collapsedFields,
          selectedId: state.selectedId,
          selectedField: state.selectedField, 
          selectedPoint: state.selectedPoint,
          lastAddedFieldId: state.lastAddedFieldId,
          lastModifiedPoint: state.lastModifiedPoint,
          lastAddedPointId: state.lastAddedPointId,
        }),
        version: 1,
      }
    )
  )
);
