"use client";

import { useSyncExternalStore } from "react";

const KEY = "guia-tech:favoritos";
const EVENT = "guia-tech:favoritos-alterados";
function snapshot() {
  try { return localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; }
}
function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) notify(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, notify);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(EVENT, notify); };
}
function parse(raw: string): number[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? Array.from(new Set(value.filter((id): id is number => typeof id === "number" && Number.isSafeInteger(id) && id > 0))) : [];
  } catch { return []; }
}
export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  return { ids: parse(raw), ready: raw !== "" };
}
export function toggleFavorite(id: number) {
  const ids = parse(snapshot());
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}
