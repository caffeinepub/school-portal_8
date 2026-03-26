import type { Student } from "@/data/mockData";
import { useState } from "react";

export function useClasses(principalId: string, students: Student[]) {
  const storageKey = `lords_custom_classes_${principalId}`;

  const [customClasses, setCustomClasses] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as string[];
    } catch {}
    return [];
  });

  const studentClasses = students
    .map((s) => s.class)
    .filter(Boolean) as string[];

  const merged = Array.from(
    new Set([...studentClasses, ...customClasses]),
  ).sort();

  const addClass = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomClasses((prev) => {
      if (prev.includes(trimmed) || studentClasses.includes(trimmed))
        return prev;
      const next = [...prev, trimmed];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return { classes: merged, addClass };
}
