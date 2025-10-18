"use client";

import { useRef } from "react";

export function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  };
}
