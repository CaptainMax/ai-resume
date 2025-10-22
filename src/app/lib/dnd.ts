// src/app/lib/dnd.ts

// ---------- Key 生成器 ----------

// Section 的 key
export const sectionKey = (id: string) => `section:${id}`;

// Field 的 key
export const fieldKey = (sectionId: string, id: string) =>
  `field:${sectionId}:${id}`;

// Point 的 key
export const pointKey = (sectionId: string, fieldId: string, pointId: string) =>
  `point:${sectionId}:${fieldId}:${pointId}`;

// ---------- 类型 ----------

export type DragKey =
  | { kind: "section"; sectionId: string }
  | { kind: "field"; sectionId: string; fieldId: string }
  | { kind: "point"; sectionId: string; fieldId: string; pointId: string };

// ---------- 解析器 ----------

export function parseDragKey(raw: string): DragKey | null {
  if (raw.startsWith("section:")) {
    return { kind: "section", sectionId: raw.slice("section:".length) };
  }
  if (raw.startsWith("field:")) {
    const parts = raw.split(":"); // field:<sid>:<fid>
    if (parts.length === 3) {
      return { kind: "field", sectionId: parts[1], fieldId: parts[2] };
    }
  }
  if (raw.startsWith("point:")) {
    const parts = raw.split(":"); // point:<sid>:<fid>:<pid>
    if (parts.length === 4) {
      return {
        kind: "point",
        sectionId: parts[1],
        fieldId: parts[2],
        pointId: parts[3],
      };
    }
  }
  return null;
}

// ---------- 工具 ----------

// 随机 id 生成器
export const uid = () => Math.random().toString(36).slice(2, 9);
