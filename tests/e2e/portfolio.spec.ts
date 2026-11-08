import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function navigateTo(page: Page, name: string) {
  const menuButton = page.getByRole("button", { name: /ouvrir le menu|open menu/i });
  if (await menuButton.isVisible()) {
    await menuButton.click();
  }
  await page.getByRole("navigation", { name: /navigation principale|main navigation|^menu$/i }).getByRole("link", { name, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, body: "{}" }));
  await page.route("**/api/content", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ content: null }),
    }),
  );
  await page.route("**/api/projects", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ projects: [], sources: { manual: 0, github: 0 } }),
    }),
  );
});

test("portfolio public: navigation, recherche projets et contact", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voir les projets" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Me contacter" })).toBeVisible();
  const recruiterBrief = page.getByRole("region", { name: "Résumé rapide pour recruteur" });
  await expect(recruiterBrief).toBeVisible();
  await expect(recruiterBrief.getByRole("link", { name: /projets clés/i })).toHaveAttribute("href", "#projets");

  await page.getByRole("button", { name: /changer la langue/i }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "View projects" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact me" })).toBeVisible();
  await page.getByRole("button", { name: /change language/i }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  await page.getByRole("button", { name: /thème sombre/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /thème clair/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("link", { name: "Voir les projets" }).click();
  await expect(page.locator("#projets")).toBeInViewport();
  await expect(page.locator("#projets").getByRole("heading", { name: /projets|projects/i })).toBeVisible();
  await expect(page.locator(".project-card").first()).toBeVisible();

  await page.getByRole("searchbox", { name: "Rechercher" }).fill("zzzzzz");
  await expect(page.getByText("Aucun projet trouvé")).toBeVisible();
  await page.getByRole("button", { name: "Réinitialiser" }).click();
  await expect(page.locator(".project-card").first()).toBeVisible();

  await navigateTo(page, "Contact");
  await expect(page.locator("#contact")).toBeInViewport();
  await expect(page.locator("#contact").getByRole("link", { name: /email/i })).toHaveAttribute("href", "mailto:sawadogovictor12@gmail.com");
  await expect(page.locator("#contact").getByRole("link", { name: /github/i })).toHaveAttribute("href", "https://github.com/seven-v73");
  await expect(page.locator("#contact").getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", "https://wa.me/2250798557035");
});

test("portfolio public: détail projet, CV et fallback API", async ({ page }) => {
  await page.route("**/api/content", (route) => route.fulfill({ status: 500, body: "{}" }));

  await page.goto("/");

  await page.getByRole("button", { name: /ouvrir le détail du projet elegantstyle/i }).click();
  await expect(page.getByRole("dialog", { name: "ElegantStyle" })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Marketplace mode multi-rôles", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Fermer" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await navigateTo(page, "CV");
  await expect(page.locator("#cv")).toBeInViewport();
  await expect(page.locator("#cv").getByRole("link", { name: "Télécharger", exact: true })).toHaveAttribute("href", /cv\.pdf|cv-image/);

  await navigateTo(page, "Certifications");
  await expect(page.locator("#certifications")).toBeInViewport();
  await expect(page.locator("#certifications").getByRole("link", { name: /Télécharger/i })).toHaveCount(0);
  await expect(page.locator("#certifications").getByRole("link", { name: "Vérifier Algorithms" })).toHaveAttribute(
    "href",
    "https://www.coursera.org/account/accomplishments/specialization/A8YJA9BK1RKZ",
  );
  await expect(page.locator("#certifications").getByRole("link", { name: /CocoMarket/ })).toHaveAttribute(
    "href",
    "https://github.com/seven-v73/CocoMarket",
  );
});

test("gestion: page de connexion et formulaire admin accessibles", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Connexion gestion portfolio" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
});

test("gestion: connexion mockée et sauvegarde du contenu", async ({ page }) => {
  let savedPayload: unknown = null;

  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "admin-1", name: "Portfolio Admin", email: "admin@portfolio.local", role: "admin" },
      }),
    }),
  );
  await page.route("**/api/content", async (route) => {
    if (route.request().method() === "PUT") {
      savedPayload = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: savedPayload }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ content: null }),
    });
  });
  await page.route("**/cv-manifest.json*", (route) => route.fulfill({ status: 404, body: "{}" }));
  await page.route("**/certifications-manifest.json*", (route) => route.fulfill({ status: 404, body: "{}" }));
  await page.route("**/profile-manifest.json*", (route) => route.fulfill({ status: 404, body: "{}" }));

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@portfolio.local");
  await page.getByLabel("Mot de passe").fill("Portfolio@2026!");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByRole("heading", { name: "Gestion du portfolio" })).toBeVisible();
  await page.getByLabel("Accroche courte").fill("Développeur produit fullstack");
  await page.getByLabel("Lien GitHub").first().fill("github.com/seven-v73/projet-test");
  await page.getByRole("button", { name: "Sauvegarder le contenu" }).click();

  await expect(page.getByText("Contenu sauvegardé. Le portfolio public est à jour.")).toBeVisible();
  expect(savedPayload).toMatchObject({
    heroEyebrow: "Développeur produit fullstack",
    projects: expect.arrayContaining([
      expect.objectContaining({ githubUrl: "github.com/seven-v73/projet-test" }),
    ]),
  });
});

test("VictoireOS: parcours rapides et commande projet", async ({ page }) => {
  await page.goto("/");
  await page.locator("#labo").scrollIntoViewIfNeeded();

  const terminalActions = page.locator(".terminal-quick-actions");
  await expect(terminalActions.getByRole("button", { name: "Voir les projets" })).toBeVisible();

  await terminalActions.getByRole("button", { name: "Voir les projets" }).click();
  await expect(page.locator(".terminal-body").getByText(/ElegantStyle/)).toBeVisible();

  await terminalActions.getByRole("button", { name: "Lire le profil" }).click();
  await expect(page.locator(".terminal-body").getByText("Victoire SAWADOGO", { exact: true })).toBeVisible();

  await page.getByLabel("Commande du shell interactif").fill("open project elegantstyle");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("ElegantStyle")).toBeVisible();
});

test("chapitre système : chaque couche renvoie à un projet qui la prouve", async ({ page }) => {
  await page.goto("/");

  const chapter = page.locator("#systeme");
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter.getByRole("heading", { level: 3 })).toHaveCount(5);
  await chapter.getByRole("button", { name: "SevenOS" }).first().click();
  await expect(page.getByRole("dialog", { name: "SevenOS" })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Code privé · démonstration sur demande")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("link", { name: /voir le code/i })).toHaveCount(0);
});

test("générateur de CV : contenu du portfolio, langues et modèles", async ({ page }) => {
  await page.goto("/cv-builder");

  const sheet = page.locator(".cv-sheet");
  await expect(sheet.getByRole("heading", { name: "Victoire SAWADOGO" })).toBeVisible();
  await expect(sheet.getByText("Expérience professionnelle")).toBeVisible();
  await expect(sheet.locator(".cvs-entry-head strong").filter({ hasText: /^SevenOS/ })).toBeVisible();
  await expect(sheet.getByRole("link", { name: "sawadogovictor12@gmail.com" })).toHaveAttribute("href", "mailto:sawadogovictor12@gmail.com");
  await expect(page.getByRole("button", { name: "Télécharger en PDF" })).toBeEnabled();

  await page.getByRole("button", { name: "Sobre (ATS)" }).click();
  await expect(page.locator(".cv-sheet.cv-ats")).toBeVisible();

  await page.getByRole("button", { name: "English" }).click();
  await expect(sheet.getByText("Experience", { exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("accessibilité : aucune violation grave détectée par axe", async ({ page }) => {
  await page.goto("/");
  // Scroll through once so every section has revealed, then measure from the top where the hero is fully opaque.
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .map((violation) => `${violation.id}: ${violation.nodes.slice(0, 3).map((node) => node.target.join(" ")).join(", ")}`);

  expect(serious).toEqual([]);
});
