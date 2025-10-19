// 1) Re-export 主 store（内部由 slices 组合而成）
export { useResumeStore } from "./index";

// 2) Re-export 类型 & 初始数据（如需在外部声明 props / mock）
export type {
  ResumeState,
  ResumeSection,
  ResumeField,
  ResumePoint,
} from "./types";
export { initialSections } from "./initial";

// 3) 常用 selectors（可选，便于减少组件订阅范围）
import { useResumeStore as _use } from "./index";

export const useSections = () => _use((s) => s.sections);
export const useCollapsed = () => _use((s) => s.collapsed);
export const useSelectedSectionId = () => _use((s) => s.selectedId);
export const useSelectedField = () => _use((s) => s.selectedField);
export const useSelectedPoint = () => _use((s) => s.selectedPoint);

// 4) 常用 actions（可选，避免组件每次手写挑选多个 action）
export const useSectionActions = () =>
  _use((s) => ({
    setSections: s.setSections,
    addSection: s.addSection,
    removeSection: s.removeSection,
    reorderSections: s.reorderSections,
    updateSectionTitle: s.updateSectionTitle,
  }));

export const useFieldActions = () =>
  _use((s) => ({
    addField: s.addField,
    removeField: s.removeField,
    updateFieldValue: s.updateFieldValue,
    reorderFields: s.reorderFields,
  }));

export const usePointActions = () =>
  _use((s) => ({
    addPoint: s.addPoint,
    removePoint: s.removePoint,
    updatePoint: s.updatePoint,
    reorderPoints: s.reorderPoints,
  }));

export const useUiActions = () =>
  _use((s) => ({
    toggleSection: s.toggleSection,
    setAllCollapsed: s.setAllCollapsed,
    setSelected: s.setSelected,
    setSelectedField: s.setSelectedField,
    setSelectedPoint: s.setSelectedPoint,
    reset: s.reset,
  }));
