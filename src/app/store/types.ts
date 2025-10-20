import { StateCreator } from "zustand";

/** 最小单位：点状条目（bullet point） */
export type ResumePoint = {
  id: string;
  content: string; // 比如 "实现订单系统，提升性能 30%"
};

/** 子字段（Field）
 *  - 可以是单值 (value)，比如 "Full Name"
 *  - 也可以是一个点列表 (points)，比如 "Skills" / "Responsibilities"
 */
export type ResumeField = {
  id: string;
  name: string;          // 字段名称，比如 "Full Name" / "Email" / "Company"
  value?: string;        // 单值内容，比如 "Jian Ma" / "B.S. in CS"
  points?: ResumePoint[]; // 多个条目，比如技能点 / 工作成就
};

/** Section（大区块）
 *  - 包含多个子字段
 *  - 比如 Header / Skills / Work Experience / Education
 */
export type ResumeSection = {
  id: string;
  title: string;         // Section 标题，比如 "Header" / "Skills"
  fields: ResumeField[]; // 子字段数组
};

/** Sections slice */
export interface SectionsSlice {
  sections: ResumeSection[];
  setSections: (sections: ResumeSection[]) => void;
  reorderSections: (oldIndex: number, newIndex: number) => void;
  addSection: (section: ResumeSection) => void;
  removeSection: (sectionId: string) => void;

  updateSectionTitle: (sectionId: string, title: string) => void;
  addField: (sectionId: string, field: ResumeField) => void;
  updateFieldValue: (sectionId: string, fieldId: string, value: string) => void;
  updateFieldName: (sectionId: string, fieldId: string, name: string) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  reorderFields: (sectionId: string, oldIndex: number, newIndex: number) => void;


  addPoint: (sectionId: string, fieldId: string, point: ResumePoint) => void;
  updatePoint: (sectionId: string, fieldId: string, pointId: string, content: string) => void;
  removePoint: (sectionId: string, fieldId: string, pointId: string) => void;
  reorderPoints: (
    sectionId: string,
    fieldId: string,
    fromIndex: number,
    toIndex: number
  ) => void;
}

/** UI slice */
export interface UiSlice {
    collapsed: Record<string, boolean>;
    toggleSection: (sectionId: string) => void;
    setAllCollapsed: (collapsed: boolean) => void;
  
    // ✅ 新增：Field 折叠状态
    collapsedFields: Record<string, boolean>;
    toggleField: (fieldKey: string) => void;
    setAllFieldsCollapsed: (collapsed: boolean) => void;
  
    selectedId: string | null; // 选中的 Section
    setSelected: (id: string | null) => void;
  
    // ✅ 新的：选中的 Field
    selectedField: { sectionId: string; fieldId: string } | null;
    setSelectedField: (sel: { sectionId: string; fieldId: string } | null) => void;
  
    // ✅ 新的：选中的 Point
    selectedPoint: { sectionId: string; fieldId: string; pointId: string } | null;
    setSelectedPoint: (
      sel: { sectionId: string; fieldId: string; pointId: string } | null
    ) => void;
  
    reset: () => void;

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
  }

/** RootState */
export type ResumeState = SectionsSlice & UiSlice;

/** Slice 工厂类型（便于在 index.ts 组合） */
export type SliceCreator<T> = StateCreator<
  ResumeState,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  T
>;
