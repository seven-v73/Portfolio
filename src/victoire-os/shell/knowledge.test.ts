import { describe, expect, it } from "vitest";
import {
  getChallenge,
  getDebugMindset,
  getLearningNotes,
  getManualPage,
  getMessageOfTheDay,
  getQuiz,
  getRoadmap,
} from "./knowledge";

describe("VictoireOS knowledge", () => {
  it("returns manual pages and fallbacks", () => {
    expect(getManualPage("python")).toContain("  python - lance un interpreteur ou un script virtuel");
    expect(getManualPage("missing")[0]).toContain("Aucune page man");
  });

  it("returns learning notes and lessons", () => {
    expect(getLearningNotes("git")[0]).toContain("Git");
    expect(getLearningNotes("unknown")[0]).toContain("en cours de documentation");
  });

  it("returns practical learning sequences", () => {
    expect(getRoadmap()[0]).toBe("Roadmap d'apprentissage");
    expect(getDebugMindset("api")[0]).toBe("Debug mindset: api");
  });

  it("returns quizzes, challenges and short messages", () => {
    expect(getQuiz("git")[0]).toBe("Quiz Git");
    expect(getChallenge("shell")[0]).toContain("Challenge shell");
    expect(getMessageOfTheDay()[0]).toBe("Message of the day");
  });
});
