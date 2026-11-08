import { describe, expect, it } from "vitest";
import { enLocale } from "../i18n/en";
import { frLocale } from "../i18n/fr";
import { certificationDomains, formatIssuedDate, getCertificationStats, getCredentialUrl } from "./certifications";

describe("certifications catalogue", () => {
  const certifications = certificationDomains.flatMap((domain) => domain.certifications);

  it("keeps credential ids unique", () => {
    const ids = certifications.map((certification) => certification.credentialId).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every domain at least one featured certification", () => {
    for (const domain of certificationDomains) {
      expect(domain.certifications.some((certification) => certification.featured), domain.id).toBe(true);
    }
  });

  it("builds Coursera verification links only when a kind is known", () => {
    expect(getCredentialUrl({ title: "Algorithms", issuer: "Stanford University", issued: "2026-09", credentialId: "A8YJA9BK1RKZ", kind: "specialization" })).toBe(
      "https://www.coursera.org/account/accomplishments/specialization/A8YJA9BK1RKZ",
    );
    expect(getCredentialUrl({ title: "TUM", issuer: "TUM", issued: "2024-11", credentialId: "FW3IU0P6539N" })).toBe("");
  });

  it("counts the catalogue", () => {
    const stats = getCertificationStats();
    expect(stats.total).toBe(certifications.length);
    expect(stats.verifiable).toBeLessThanOrEqual(stats.total);
    expect(stats.domains).toBe(certificationDomains.length);
  });

  it("formats issue dates and ignores missing ones", () => {
    expect(formatIssuedDate("2026-10", "en")).toBe("Oct 2026");
    expect(formatIssuedDate("", "fr")).toBe("");
  });
});

describe("project copy", () => {
  it("uses the same project names in both languages so GitHub metadata can be matched", () => {
    expect(enLocale.content.projects.map((project) => project.name)).toEqual(frLocale.content.projects.map((project) => project.name));
  });
});
