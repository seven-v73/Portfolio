import { expect, test } from "@playwright/test";

test("portfolio public: navigation, recherche projets et contact", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voir les projets" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Me contacter" })).toBeVisible();
  const recruiterBrief = page.getByRole("region", { name: "Résumé rapide pour recruteur" });
  await expect(recruiterBrief).toBeVisible();
  await expect(recruiterBrief.getByRole("link", { name: /3 projets clés/i })).toHaveAttribute("href", "#projets");

  await page.getByRole("button", { name: /ouvrir la navigation/i }).click();
  await page.getByRole("button", { name: /changer la langue/i }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "View projects" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact me" })).toBeVisible();
  await page.getByRole("button", { name: /change language/i }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  await page.getByRole("button", { name: /basculer en mode clair/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /basculer en mode sombre/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const laptop = page.getByRole("button", { name: /fermer la navigation/i });
  const beforeDrag = await page.locator(".floating-laptop-bar").boundingBox();
  const laptopBox = await laptop.boundingBox();
  expect(beforeDrag).not.toBeNull();
  expect(laptopBox).not.toBeNull();
  await page.mouse.move(laptopBox!.x + laptopBox!.width / 2, laptopBox!.y + laptopBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(laptopBox!.x + 120, laptopBox!.y + 90, { steps: 8 });
  await page.mouse.up();
  const afterDrag = await page.locator(".floating-laptop-bar").boundingBox();
  expect(afterDrag).not.toBeNull();
  expect(Math.max(Math.abs(afterDrag!.x - beforeDrag!.x), Math.abs(afterDrag!.y - beforeDrag!.y))).toBeGreaterThan(40);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /ouvrir la navigation/i })).toBeVisible();

  await page.getByRole("link", { name: "Voir les projets" }).click();
  await expect(page.getByRole("heading", { name: /projets|contexte/i })).toBeVisible();
  await expect(page.locator(".project-card").first()).toBeVisible();

  await page.getByRole("searchbox", { name: "Rechercher" }).fill("zzzzzz");
  await expect(page.getByText("Aucun projet trouvé")).toBeVisible();
  await page.getByRole("button", { name: "Réinitialiser" }).click();
  await expect(page.locator(".project-card").first()).toBeVisible();

  await page.getByRole("button", { name: /ouvrir la navigation/i }).click();
  await page.getByLabel("Navigation principale").getByRole("link", { name: "Contact", exact: true }).click();
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
  await expect(page.getByRole("dialog").getByText("Stylisme virtuel", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Fermer" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: /ouvrir la navigation/i }).click();
  await page.getByLabel("Navigation principale").getByRole("link", { name: "CV", exact: true }).click();
  await expect(page.locator("#cv")).toBeInViewport();
  await expect(page.getByRole("link", { name: "Télécharger", exact: true })).toHaveAttribute("href", /cv\.pdf|cv-image/);

  await page.getByRole("button", { name: /ouvrir la navigation/i }).click();
  await page.getByLabel("Navigation principale").getByRole("link", { name: "Certifications", exact: true }).click();
  await expect(page.locator("#certifications")).toBeInViewport();
  await expect(page.locator("#certifications").getByRole("link", { name: /Télécharger/i })).toHaveCount(0);
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

  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, body: "{}" }));
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
  await expect(terminalActions.getByRole("button", { name: "Parcours recruteur" })).toBeVisible();

  await terminalActions.getByRole("button", { name: "Mode développeur" }).click();
  await expect(page.getByText("Atelier shell architecture")).toBeVisible();

  await terminalActions.getByRole("button", { name: "Parcours recruteur" }).click();
  await expect(page.getByText("visitor: recruiter")).toBeVisible();

  await page.getByLabel("Commande du shell interactif").fill("open project elegantstyle");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("ElegantStyle")).toBeVisible();
});
