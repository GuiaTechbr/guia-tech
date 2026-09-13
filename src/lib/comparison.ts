"use client";

import { useSyncExternalStore } from "react";

const KEY = "guia-tech:comparacao";
const EVENT = "guia-tech:comparacao-alterada";
const MAX_PRODUCTS = 3;

function snapshot() {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      notify();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, notify);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, notify);
  };
}

function parse(raw: string): number[] {
  try {
    const value: unknown = JSON.parse(raw);

    if (!Array.isArray(value)) {
      return [];
    }

    return Array.from(
      new Set(
        value.filter(
          (id): id is number =>
            typeof id === "number" &&
            Number.isSafeInteger(id) &&
            id > 0
        )
      )
    ).slice(0, MAX_PRODUCTS);
  } catch {
    return [];
  }
}

function save(ids: number[]) {
  localStorage.setItem(
    KEY,
    JSON.stringify(ids.slice(0, MAX_PRODUCTS))
  );

  window.dispatchEvent(new Event(EVENT));
}

export function useComparison() {
  const raw = useSyncExternalStore(
    subscribe,
    snapshot,
    () => ""
  );

  return {
    ids: parse(raw),
    ready: raw !== "",
  };
}

export function toggleComparison(
  id: number
): "added" | "removed" | "limit" {
  const ids = parse(snapshot());

  if (ids.includes(id)) {
    save(ids.filter((item) => item !== id));
    return "removed";
  }

  if (ids.length >= MAX_PRODUCTS) {
    return "limit";
  }

  save([...ids, id]);

  return "added";
}

export function clearComparison() {
  save([]);
}