import { expect, test, type Page } from "@playwright/test";

async function enterName(page: Page, name: string) {
  await page.getByLabel("Your name").fill(name);
}

test("two players play a full turn: create, join, draw, guess, score", async ({ browser }) => {
  const host = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const guest = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();

  // Host creates a room.
  await host.goto("/");
  await enterName(host, "Rina");
  await host.getByRole("button", { name: "Create a room" }).click();
  await expect(host).toHaveURL(/\/r\/[A-Z]{5}$/);
  const code = host.url().split("/").pop()!;
  await expect(host.getByRole("heading", { name: `Room ${code}` })).toBeVisible();

  // Guest opens the invite link and joins.
  await guest.goto(`/r/${code}`);
  await expect(guest.getByRole("heading", { name: `You're invited to room ${code}` })).toBeVisible();
  await enterName(guest, "Bayu");
  await guest.getByRole("button", { name: `Join room ${code}` }).click();
  await expect(guest.getByRole("heading", { name: "Game settings" })).toBeVisible();
  await expect(host.getByText("Bayu").first()).toBeVisible();

  // Host changes a setting; the guest sees it.
  await host.getByRole("radiogroup", { name: "Rounds" }).getByRole("radio", { name: "2" }).click();
  await expect(guest.getByRole("radiogroup", { name: "Rounds" }).getByRole("radio", { name: "2" })).toHaveAttribute("aria-checked", "true");

  await host.getByRole("button", { name: "Start game" }).click();

  // The host draws first (first to join).
  await expect(host.getByRole("heading", { name: "Your turn. Pick a word to draw" })).toBeVisible();
  await expect(guest.getByRole("heading", { name: "Rina is picking a word" })).toBeVisible();
  await host.locator(".pick").first().click();

  const word = (await host.locator(".drawer-note strong").textContent())!.trim();
  expect(word.length).toBeGreaterThan(1);

  // Guest sees the category and hidden tiles, not the word.
  await expect(guest.locator(".category-chip")).toBeVisible();
  await expect(guest.locator(".tiles")).toHaveAttribute("aria-label", /Hidden word/);

  // Host draws a stroke; it appears on the guest's canvas.
  const canvas = host.locator("canvas.canvas");
  const box = (await canvas.boundingBox())!;
  await host.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await host.mouse.down();
  for (let i = 0; i <= 10; i++) await host.mouse.move(box.x + box.width * (0.3 + i * 0.04), box.y + box.height * (0.3 + i * 0.03));
  await host.mouse.up();
  await expect
    .poll(async () =>
      guest.locator("canvas.canvas").evaluate((c: HTMLCanvasElement) => {
        const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
        let dark = 0;
        for (let i = 0; i < d.length; i += 16) if (d[i] < 100) dark++;
        return dark;
      }),
    )
    .toBeGreaterThan(50);

  // A wrong guess is shown to everyone; the right one scores.
  await guest.getByPlaceholder("Type your guess…").fill("definitely not it");
  await guest.keyboard.press("Enter");
  await expect(host.getByText("definitely not it")).toBeVisible();
  await guest.getByPlaceholder("Type your guess…").fill(word.toUpperCase());
  await guest.keyboard.press("Enter");
  await expect(guest.getByText("Bayu guessed the word").first()).toBeVisible();

  // Everyone guessed, so the turn ends and reveals the word.
  await expect(host.locator(".reveal-word")).toHaveText(word);
  await expect(guest.locator(".reveal-word")).toHaveText(word);

  // Next turn: the guest draws.
  await expect(guest.getByRole("heading", { name: "Your turn. Pick a word to draw" })).toBeVisible({ timeout: 15_000 });
});

test("joining a room that doesn't exist explains what to do", async ({ page }) => {
  await page.goto("/");
  await enterName(page, "Mei");
  await page.getByLabel("Room code").fill("ZZZZZ");
  await page.getByRole("button", { name: "Join", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("No room with code ZZZZZ");
});
