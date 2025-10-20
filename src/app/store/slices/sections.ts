import { SliceCreator } from "../types";
import { initialSections } from "../initial";
import { ResumeSection, ResumeField, ResumePoint, SectionsSlice } from "../types";

export const createSectionsSlice: SliceCreator<SectionsSlice> = (set, get) => ({
  sections: initialSections,

  // ---------- Section 操作 ----------
  setSections: (sections: ResumeSection[]) => set({ sections }),

  reorderSections: (oldIndex, newIndex) =>
    set((state) => {
      const arr = [...state.sections];
      const [moved] = arr.splice(oldIndex, 1);
      arr.splice(newIndex, 0, moved);
      return { sections: arr };
    }),

  addSection: (section: ResumeSection) =>
    set((s) => ({ sections: [...s.sections, section] })),

  removeSection: (sectionId: string) =>
    set((s) => ({ sections: s.sections.filter((x) => x.id !== sectionId) })),

  updateSectionTitle: (sectionId: string, title: string) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, title } : s
      ),
    })),

  // ---------- Field 操作 ----------
  addField: (sectionId: string, field: ResumeField) =>
    set((state) => {
      const newState = {
        sections: state.sections.map((s) =>
          s.id === sectionId
            ? { ...s, fields: [...(s.fields ?? []), field] }
            : s
        ),
      };
      // 记录最后添加的field ID，以便进行undo
      get().setLastAddedFieldId(field.id);
      return newState;
    }),

  // ✅ 更新 Field 值
  updateFieldValue: (sectionId: string, fieldId: string, value: string) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: (s.fields ?? []).map((f) =>
                f.id === fieldId ? { ...f, value } : f
              ),
            }
          : s
      ),
    })),

  // ✅ 更新 Field 名称
  updateFieldName: (sectionId: string, fieldId: string, name: string) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: (s.fields ?? []).map((f) =>
                f.id === fieldId ? { ...f, name } : f
              ),
            }
          : s
      ),
    })),

  removeField: (sectionId: string, fieldId: string) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? { ...s, fields: (s.fields ?? []).filter((f) => f.id !== fieldId) }
          : s
      ),
    })),

    // ✅ 【新增】Field 拖动排序
    reorderFields: (sectionId: string, oldIndex: number, newIndex: number) =>
        set((state) => ({
        sections: state.sections.map((s) => {
            if (s.id !== sectionId) return s;
            const fields = [...(s.fields ?? [])];
            const [moved] = fields.splice(oldIndex, 1);
            fields.splice(newIndex, 0, moved);
            return { ...s, fields };
        }),
    })),
  



  // ---------- Point 操作 ----------
  addPoint: (sectionId: string, fieldId: string, point: ResumePoint) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: (s.fields ?? []).map((f) =>
                f.id === fieldId
                  ? { ...f, points: [...(f.points ?? []), point] }
                  : f
              ),
            }
          : s
      ),
    })),

  updatePoint: (
    sectionId: string,
    fieldId: string,
    pointId: string,
    content: string
  ) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: (s.fields ?? []).map((f) =>
                f.id === fieldId
                  ? {
                      ...f,
                      points: (f.points ?? []).map((p) =>
                        p.id === pointId ? { ...p, content } : p
                      ),
                    }
                  : f
              ),
            }
          : s
      ),
    })),
  // ✅ Point 拖拽排序
reorderPoints: (
  sectionId: string,
  fieldId: string,
  fromIndex: number,
  toIndex: number
) =>
  set((state) => {
    const sections = [...state.sections];
    const sectionIndex = sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return {};

    const section = sections[sectionIndex];
    const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return {};

    const points = [...(section.fields[fieldIndex].points ?? [])];
    const [moved] = points.splice(fromIndex, 1);
    points.splice(toIndex, 0, moved);
    section.fields[fieldIndex].points = points;

    return { sections };
  }),



  removePoint: (sectionId: string, fieldId: string, pointId: string) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: (s.fields ?? []).map((f) =>
                f.id === fieldId
                  ? {
                      ...f,
                      points: (f.points ?? []).filter((p) => p.id !== pointId),
                    }
                  : f
              ),
            }
          : s
      ),
    })),
});
