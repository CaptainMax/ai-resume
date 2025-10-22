import { SliceCreator } from './common';

/** UI slice - 管理所有UI状态 */
export interface UiSlice {
  // 折叠状态管理
  collapsed: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;
  setAllCollapsed: (collapsed: boolean) => void;

  // Field 折叠状态
  collapsedFields: Record<string, boolean>;
  toggleField: (fieldKey: string) => void;
  setAllFieldsCollapsed: (collapsed: boolean) => void;

  // 选中状态管理
  selectedId: string | null; // 选中的 Section
  setSelected: (id: string | null) => void;

  // 选中的 Field
  selectedField: { sectionId: string; fieldId: string } | null;
  setSelectedField: (sel: { sectionId: string; fieldId: string } | null) => void;

  // 选中的 Point
  selectedPoint: { sectionId: string; fieldId: string; pointId: string } | null;
  setSelectedPoint: (
    sel: { sectionId: string; fieldId: string; pointId: string } | null
  ) => void;

  reset: () => void;

  // 撤销/重做状态管理
  lastAddedFieldId: string | null; // 用于跟踪最后添加的field，以便进行undo
  setLastAddedFieldId: (id: string | null) => void;
  
  lastModifiedPoint: { sectionId: string; fieldId: string; pointId: string; originalContent: string } | null; // 用于跟踪最后修改的point
  setLastModifiedPoint: (point: { sectionId: string; fieldId: string; pointId: string; originalContent: string } | null) => void;
  
  lastAddedPointId: string | null; // 用于跟踪最后添加的point，以便进行undo
  setLastAddedPointId: (id: string | null) => void;
  
  // AI修改高亮状态
  aiModifiedPoints: Set<string>; // 存储被AI修改的point IDs
  addAiModifiedPoint: (pointId: string) => void;
  removeAiModifiedPoint: (pointId: string) => void;
  clearAiModifiedPoints: () => void;
  
  // AI修改的原始内容
  aiOriginalContents: Record<string, string>; // 存储AI修改前的原始内容
  setAiOriginalContent: (pointId: string, originalContent: string) => void;
  removeAiOriginalContent: (pointId: string) => void;
  
  // 撤销提示状态
  showUndoPrompt: boolean;
  setShowUndoPrompt: (show: boolean) => void;
}
