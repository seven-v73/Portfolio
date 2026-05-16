import { expect, test } from "@playwright/test";

test("portfolio public: navigation, recherche projets et contact", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /applications utiles/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Accès rapides" })).toBeVisible();

  await page.getByRole("link", { name: "Voir les projets" }).click();
  await expect(page.getByRole("heading", { name: /projets concrets/i })).toBeVisible();
  await expect(page.locator(".project-card").first()).toBeVisible();

  await page.getByRole("searchbox", { name: "Rechercher" }).fill("zzzzzz");
  await expect(page.getByText("Aucun projet trouvé")).toBeVisible();
  await page.getByRole("button", { name: "Réinitialiser" }).click();
  await expect(page.locator(".project-card").first()).toBeVisible();

  await page.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page.locator("#contact")).toBeInViewport();
});

test("gestion: page de connexion et formulaire admin accessibles", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Connexion gestion portfolio" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
});

test("VictoireOS: parcours rapides et commande projet", async ({ page }) => {
  await page.goto("/");

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
