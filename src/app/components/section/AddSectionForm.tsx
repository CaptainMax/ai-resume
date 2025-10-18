"use client";

import { useState } from "react";
import { useResumeStore } from "@/app/store/useResumeStore";
import { ResumeSection } from "@/app/store/types";

// 可创建的 Section 列表
const sectionTemplates: { id: string; title: string }[] = [
  { id: "header", title: "Header" },
  { id: "skills", title: "Skills" },
  { id: "work", title: "Work Experience" },
  { id: "education", title: "Education" },
  { id: "certs", title: "Certifications / Awards" },
  { id: "projects", title: "Projects" },
  { id: "summary", title: "Summary" },
  { id: "languages", title: "Languages" },
  { id: "volunteer", title: "Volunteer / Leadership" },
  { id: "portfolio", title: "Portfolio / Publications" },
];

export default function AddSectionForm() {
  const { addSection } = useResumeStore();
  const [selected, setSelected] = useState(sectionTemplates[0].id);

  const handleAdd = () => {
    const template = sectionTemplates.find((s) => s.id === selected);
    if (!template) return;

    const newSection: ResumeSection = {
      id: `${template.id}-${crypto.randomUUID().slice(0, 8)}`,
      title: template.title,
      fields: [],
    };

    addSection(newSection);
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <select
        className="flex-1 border rounded px-2 py-1 text-sm"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {sectionTemplates.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>

      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
      >
        添加
      </button>
    </div>
  );
}
