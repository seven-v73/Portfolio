import { afterEach, describe, expect, it, vi } from "vitest";
import { getGithubProjects } from "./githubProjects.js";

function repo(name, overrides = {}) {
  return {
    name,
    full_name: `seven-v73/${name}`,
    html_url: `https://github.com/seven-v73/${name}`,
    language: "Python",
    pushed_at: "2026-01-01T00:00:00Z",
    fork: false,
    private: false,
    topics: [],
    ...overrides,
  };
}

describe("getGithubProjects", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("puts flagship repositories first and hides forks and course exercises", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => [
          repo("Learning_C", { pushed_at: "2026-11-01T00:00:00Z" }),
          repo("library", { pushed_at: "2026-10-01T00:00:00Z" }),
          repo("SDM"),
          repo("CocoMarket"),
          repo("openclaw", { fork: true }),
        ],
      })),
    );

    const projects = await getGithubProjects({ force: true });

    expect(projects.map((project) => project.name)).toEqual(["CocoMarket", "Simplon Device Manager", "Library"]);
  });
});
