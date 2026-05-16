import { describe, expect, it } from "vitest";
import { defaultMemory, loadVictoireMemory, saveVictoireMemory, victoireMemoryKey } from "./memory";

function createMemoryStorage(initialValue?: string) {
  const store = new Map<string, string>();
  if (initialValue !== undefined) {
    store.set(victoireMemoryKey, initialValue);
  }

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  };
}

describe("VictoireOS memory", () => {
  it("returns defaults when storage is unavailable", () => {
    expect(loadVictoireMemory(null)).toEqual(defaultMemory);
  });

  it("merges stored memory with defaults", () => {
    const storage = createMemoryStorage(JSON.stringify({ visitor: "recruiter", commands: ["whoami"] }));
    expect(loadVictoireMemory(storage)).toMatchObject({
      visitor: "recruiter",
      commands: ["whoami"],
      goal: defaultMemory.goal,
    });
  });

  it("recovers from invalid JSON", () => {
    expect(loadVictoireMemory(createMemoryStorage("{bad json"))).toEqual(defaultMemory);
  });

  it("persists memory to storage", () => {
    const storage = createMemoryStorage();
    saveVictoireMemory({ ...defaultMemory, visitor: "client" }, storage);
    expect(JSON.parse(storage.getItem(victoireMemoryKey) || "{}")).toMatchObject({ visitor: "client" });
  });
});
