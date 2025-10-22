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

/** Slice 工厂类型（便于在 index.ts 组合） */
export type SliceCreator<T> = StateCreator<
  ResumeState,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  T
>;

// 导入具体的slice类型
import type { SectionsSlice } from './sections';
import type { UiSlice } from './ui';

/** RootState - 组合所有slice */
export type ResumeState = SectionsSlice & UiSlice;
