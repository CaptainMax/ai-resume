import { ResumeSection, ResumeField, ResumePoint, SliceCreator } from './common';

/** Sections slice - 管理简历内容 */
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
