// 导出所有类型定义
export * from './common';
export * from './sections';
export * from './ui';

// 重新导出常用类型，方便使用
export type {
  ResumeState,
  ResumeSection,
  ResumeField,
  ResumePoint,
  SliceCreator
} from './common';

export type { SectionsSlice } from './sections';
export type { UiSlice } from './ui';
