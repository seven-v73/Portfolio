import type { VictoireMemory } from "../types";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export const victoireMemoryKey = "victoire-os-memory";

export const defaultMemory: VictoireMemory = {
  commands: [],
  goal: "explorer le portfolio intelligemment",
  persona: "dev",
  mission: "",
  missionStep: 0,
  autopilot: false,
  coach: false,
  visitor: "unknown",
  visitedProjects: [],
  lastActiveAt: "",
};

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function loadVictoireMemory(storage: StorageLike | null = getBrowserStorage()): VictoireMemory {
  if (!storage) return defaultMemory;
  try {
    const storedMemory = storage.getItem(victoireMemoryKey);
    if (!storedMemory) return defaultMemory;
    return { ...defaultMemory, ...JSON.parse(storedMemory) };
  } catch {
    return defaultMemory;
  }
}

export function saveVictoireMemory(memory: VictoireMemory, storage: StorageLike | null = getBrowserStorage()) {
  if (!storage) return;
  storage.setItem(victoireMemoryKey, JSON.stringify(memory));
}
