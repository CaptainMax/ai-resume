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
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? { ...s, fields: [...(s.fields ?? []), field] }
          : s
      ),
    })),

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
