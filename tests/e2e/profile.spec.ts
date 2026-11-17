import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as Window & { cumulativeLayoutShift?: number };
    state.cumulativeLayoutShift = 0;

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) {
          state.cumulativeLayoutShift =
            (state.cumulativeLayoutShift ?? 0) + entry.value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto("/");
});

test("shows the complete personal link hub", async ({ page }) => {
  await expect(page).toHaveTitle("Sam Jing Wen - Software Engineer");
  await expect(
    page.getByRole("heading", { name: "Sam Jing Wen" }),
  ).toBeVisible();
  await expect(page.getByText("Software Engineer")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Portrait of Sam Jing Wen" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Sam Jing Wen is a software engineer building UltraCareer and FreeQuantCamp. Find his work and professional links.",
  );

  const destinations = page
    .getByRole("navigation", { name: "Find Sam online" })
    .getByRole("link");
  await expect(destinations).toHaveCount(4);
  await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/samjingwen/",
  );
  await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/samjingwen/",
  );
  await expect(page.getByRole("link", { name: "Email" })).toHaveAttribute(
    "href",
    "mailto:samjingwen@u.nus.edu",
  );
  await expect(
    page.getByRole("link", { name: "The Woke Coder" }),
  ).toHaveAttribute("href", "https://thewokecoder.io/");

  const selectedWork = page.getByRole("region", { name: "Selected work" });
  await expect(selectedWork.getByRole("link")).toHaveCount(2);
  const ultraCareer = selectedWork.getByRole("link", {
    name: /ultracareer\.ai Finds matching jobs/,
  });
  const freeQuantCamp = selectedWork.getByRole("link", {
    name: /freequantcamp\.com Focused mathematics/,
  });
  for (const [link, href] of [
    [ultraCareer, "https://ultracareer.ai/"],
    [freeQuantCamp, "https://freequantcamp.com/"],
  ] as const) {
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expect(
    page.getByRole("heading", { name: /projects|selected work/i }),
  ).toHaveCount(0);
});

test("groups the identity and uses accessible icon-only links", async ({
  page,
}) => {
  const identity = page.locator(".identity");
  await expect(identity.getByText("Hello")).toBeVisible();
  await expect(
    identity.getByRole("heading", { name: "Sam Jing Wen" }),
  ).toBeVisible();
  await expect(identity.getByText("Software Engineer")).toBeVisible();
  await expect(identity.locator(":scope > :first-child")).toHaveRole("heading");
  await expect(identity.locator(".identity-meta")).toContainText(
    "Hello / 你好 · Software Engineer",
  );

  const identityGap = Number.parseFloat(
    await identity.evaluate((element) => getComputedStyle(element).rowGap),
  );
  expect(identityGap).toBeGreaterThanOrEqual(10);

  const destinations = page
    .getByRole("navigation", { name: "Find Sam online" })
    .getByRole("link");

  for (const destination of await destinations.all()) {
    await expect(destination).toHaveText("");
    await expect(destination.locator("svg")).toHaveCount(1);
  }
});

test("keeps the profile centered with touch-sized destinations", async ({
  page,
}) => {
  const geometry = await page.evaluate(() => {
    const centeredSelectors = [
      ".identity",
      ".portrait-frame",
      ".destinations",
      ".selected-work",
    ];
    const centers = centeredSelectors.map((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      const box = element.getBoundingClientRect();
      return box.left + box.width / 2;
    });
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".destinations a, .selected-work a",
      ),
      (element) => {
        const box = element.getBoundingClientRect();
        return { width: box.width, height: box.height };
      },
    );

    return { viewportCenter: window.innerWidth / 2, centers, targets };
  });

  for (const center of geometry.centers) {
    expect(Math.abs(center - geometry.viewportCenter)).toBeLessThan(2);
  }

  for (const target of geometry.targets) {
    expect(target.width).toBeGreaterThanOrEqual(44);
    expect(target.height).toBeGreaterThanOrEqual(44);
  }
});

test("uses a restrained single-color name and tactile surfaces", async ({
  page,
}) => {
  const name = page.getByRole("heading", { name: "Sam Jing Wen" });
  const portrait = page.locator(".portrait-frame");
  const firstDestination = page
    .getByRole("navigation", { name: "Find Sam online" })
    .getByRole("link")
    .first();
  const firstWorkLink = page
    .getByRole("region", { name: "Selected work" })
    .getByRole("link")
    .first();

  await expect(name.locator("span")).toHaveCount(0);
  const nameSize = Number.parseFloat(await name.evaluate(getFontSize));
  expect(nameSize).toBeLessThanOrEqual(72);

  await expect(portrait).toHaveCSS("border-radius", "16px");
  await expect(firstDestination).toHaveCSS("border-radius", "12px");
  await expect(firstWorkLink).toHaveCSS("border-radius", "12px");
  await expect(firstWorkLink).toHaveCSS("border-top-width", "1px");
  expect(await portrait.evaluate(getBoxShadow)).not.toBe("none");
  expect(await firstDestination.evaluate(getBoxShadow)).not.toBe("none");
  const restingWorkShadow = await firstWorkLink.evaluate(getBoxShadow);
  expect(restingWorkShadow).not.toBe("none");

  await firstWorkLink.hover();
  await expect(firstWorkLink.locator(".work-domain")).toHaveCSS(
    "color",
    "rgb(125, 207, 255)",
  );
  await expect
    .poll(() => firstWorkLink.evaluate(getBoxShadow))
    .not.toBe(restingWorkShadow);
});

test("shows keyboard focus on every destination", async ({ page }) => {
  const destinations = page
    .getByRole("navigation", { name: "Find Sam online" })
    .getByRole("link");
  const selectedWork = page
    .getByRole("region", { name: "Selected work" })
    .getByRole("link");

  for (const destination of [
    ...(await destinations.all()),
    ...(await selectedWork.all()),
  ]) {
    await page.keyboard.press("Tab");
    await expect(destination).toBeFocused();
    await expect(destination).toHaveCSS("outline-style", "solid");
    await expect(destination).toHaveCSS("outline-width", "2px");
  }
});

test("keeps particle interactions behind clickable content", async ({
  page,
}) => {
  const canvas = page.locator("#particle-field");
  await expect(canvas).toHaveCSS("pointer-events", "none");

  await page.evaluate(() => {
    const events: string[] = [];
    Object.assign(window, { interactionEvents: events });
    document.addEventListener(
      "pointerdown",
      () => events.push("document-pointer"),
      { capture: true, once: true },
    );
    document
      .querySelector<HTMLAnchorElement>(".destinations a")
      ?.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          events.push("link-click");
        },
        { once: true },
      );
  });

  await page.getByRole("link", { name: "LinkedIn" }).click();

  const events = await page.evaluate(
    () =>
      (window as typeof window & { interactionEvents: string[] })
        .interactionEvents,
  );
  expect(events).toEqual(["document-pointer", "link-click"]);
});

test("has no horizontal overflow", async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
});

test("keeps the first view stable while assets load", async ({ page }) => {
  await page.waitForTimeout(1_200);

  const cumulativeLayoutShift = await page.evaluate(
    () =>
      (window as Window & { cumulativeLayoutShift?: number })
        .cumulativeLayoutShift ?? 0,
  );

  expect(cumulativeLayoutShift).toBeLessThan(0.1);
});

test("has no automatically detectable accessibility violations", async ({
  page,
}) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

function getFontSize(element: Element): string {
  return getComputedStyle(element).fontSize;
}

function getBoxShadow(element: Element): string {
  return getComputedStyle(element).boxShadow;
}
