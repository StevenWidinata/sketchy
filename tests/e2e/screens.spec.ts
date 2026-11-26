import { expect, test, type Page } from "@playwright/test";

// Screenshot tour of every game screen. Run with: SHOTS=1 npx playwright test screens
test.skip(!process.env.SHOTS, "set SHOTS=1 to take screenshots");

const out = (name: string) => `shots/game/${name}.png`;

async function doodle(page: Page) {
  const box = (await page.locator("canvas.canvas").boundingBox())!;
  const at = (x: number, y: number) => [box.x + box.width * x, box.y + box.height * y] as const;
  const line = async (pts: [number, number][]) => {
    await page.mouse.move(...at(...pts[0]));
    await page.mouse.down();
    for (const p of pts.slice(1)) await page.mouse.move(...at(...p), { steps: 6 });
    await page.mouse.up();
  };
  // A sun over a little house.
  const sun: [number, number][] = [];
  for (let a = 0; a <= 24; a++) sun.push([0.75 + Math.cos((a / 24) * Math.PI * 2) * 0.08, 0.25 + Math.sin((a / 24) * Math.PI * 2) * 0.1]);
  await line(sun);
  await line([[0.2, 0.55], [0.35, 0.35], [0.5, 0.55]]);
  await line([[0.23, 0.55], [0.23, 0.82], [0.47, 0.82], [0.47, 0.55]]);
  await line([[0.32, 0.82], [0.32, 0.68], [0.38, 0.68], [0.38, 0.82]]);
  await page.getByRole("radio", { name: "Yellow" }).click();
  await page.getByRole("radio", { name: "Fill (F)" }).click();
  await page.mouse.click(...at(0.75, 0.25));
  await page.getByRole("radio", { name: "Pen (B)" }).click();
}

test("screens", async ({ browser }) => {
  test.setTimeout(240_000);
  const host = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const phone = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const third = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();

  await host.goto("/");
  await host.getByLabel("Your name").fill("Rina");
  await host.getByRole("button", { name: "Create a room" }).click();
  await expect(host).toHaveURL(/\/r\/[A-Z]{5}$/);
  const code = host.url().split("/").pop()!;

  await phone.goto(`/r/${code}`);
  await phone.screenshot({ path: out("invite-phone") });
  await phone.getByLabel("Your name").fill("Bayu");
  await phone.getByRole("button", { name: `Join room ${code}` }).click();
  await third.goto("/");
  await third.getByLabel("Your name").fill("Mei");
  await third.getByLabel("Room code").fill(code);
  await third.getByRole("button", { name: "Join", exact: true }).click();
  await expect(host.getByText("Mei").first()).toBeVisible();

  await host.getByRole("radiogroup", { name: "Rounds" }).getByRole("radio", { name: "2" }).click();
  await host.getByRole("radiogroup", { name: "Mode" }).getByRole("radio", { name: "Speed round" }).click();
  await host.waitForTimeout(800);
  await host.screenshot({ path: out("lobby-desktop") });
  await phone.screenshot({ path: out("lobby-phone"), fullPage: true });

  await host.getByRole("button", { name: "Start game" }).click();
  await expect(host.locator(".pick").first()).toBeVisible();
  await host.waitForTimeout(700);
  await host.screenshot({ path: out("choosing-desktop") });
  await phone.screenshot({ path: out("choosing-phone") });
  await host.locator(".pick").first().click();
  const word = (await host.locator(".drawer-note strong").textContent())!.trim();
  await doodle(host);
  await third.getByPlaceholder("Type your guess…").fill("a castle");
  await third.keyboard.press("Enter");
  await phone.getByPlaceholder("Type your guess…").fill(word);
  await phone.keyboard.press("Enter");
  await host.waitForTimeout(400);
  await host.screenshot({ path: out("drawing-desktop") });
  await third.screenshot({ path: out("guessing-desktop") });
  await phone.screenshot({ path: out("guessed-phone") });
  await third.getByPlaceholder("Type your guess…").fill(word);
  await third.keyboard.press("Enter");
  await expect(host.locator(".reveal-word")).toBeVisible();
  await host.waitForTimeout(900);
  await host.screenshot({ path: out("reveal-desktop") });
  await phone.screenshot({ path: out("reveal-phone") });

  // Play out the remaining turns quickly.
  const pages = [host, phone, third];
  for (let turn = 0; turn < 5; turn++) {
    const drawer = await Promise.race(
      pages.map((p) => p.locator(".pick").first().waitFor({ timeout: 20_000 }).then(() => p)),
    );
    if (turn === 0) await drawer.screenshot({ path: out("choosing-phone-drawer") });
    await drawer.locator(".pick").first().click();
    const w = (await drawer.locator(".drawer-note strong").textContent())!.trim();
    if (turn === 0) {
      await doodle(drawer).catch(() => {});
      await drawer.screenshot({ path: out("drawing-phone") });
    }
    for (const p of pages) {
      if (p === drawer) continue;
      await p.getByPlaceholder("Type your guess…").fill(w);
      await p.keyboard.press("Enter");
    }
  }
  await expect(host.locator(".podium-title")).toBeVisible({ timeout: 30_000 });
  await host.waitForTimeout(1800);
  await host.screenshot({ path: out("podium-desktop"), fullPage: true });
  await phone.screenshot({ path: out("podium-phone"), fullPage: true });
  await host.locator(".gallery-item").first().click();
  await host.waitForTimeout(3000);
  await host.screenshot({ path: out("replay-desktop") });
});
