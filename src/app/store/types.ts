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
