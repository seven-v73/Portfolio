import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("normalizes accents and spaces", () => {
    expect(slugify("Développeur Mobile & API")).toBe("developpeur-mobile-and-api");
  });

  it("removes unsafe separators", () => {
    expect(slugify("BAOBAB / MonBaobab")).toBe("baobab-monbaobab");
  });
});
