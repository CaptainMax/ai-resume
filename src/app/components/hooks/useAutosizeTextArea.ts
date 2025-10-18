"use client";

import { useEffect } from "react";

export function useAutosizeTextArea(ref: HTMLTextAreaElement | null, value: string) {
  useEffect(() => {
    if (!ref) return;
    ref.style.height = "0px";
    const scrollH = ref.scrollHeight;
    ref.style.height = Math.min(scrollH, 280) + "px"; // 最多约 8 行
  }, [ref, value]);
}
