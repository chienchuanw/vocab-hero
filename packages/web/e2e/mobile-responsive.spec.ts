import { test, expect, devices } from '@playwright/test';

const mobileIPhone = test.extend({});
mobileIPhone.use({ ...devices['iPhone 12'] });

const mobilePixel = test.extend({});
mobilePixel.use({ ...devices['Pixel 5'] });

const tabletIPad = test.extend({});
tabletIPad.use({ ...devices['iPad (gen 7)'] });

mobileIPhone('should display mobile layout on vocabulary page', async ({ page }) => {
  await page.goto('/vocabulary');
  await page.waitForLoadState('networkidle');

  const header = page.locator('h1:has-text("Vocabulary")');
  await expect(header).toBeVisible();

  const addButton = page.getByRole('button', { name: 'Add Word' });
  await expect(addButton).toBeVisible();

  const bottomNav = page.locator('nav').last();
  await expect(bottomNav).toBeVisible();
});

mobileIPhone('should display mobile layout on progress page', async ({ page }) => {
  await page.goto('/progress');
  await page.waitForLoadState('networkidle');

  const header = page.locator('h1:has-text("Progress")');
  await expect(header).toBeVisible();

  const statsGrid = page.locator('.grid');
  await expect(statsGrid.first()).toBeVisible();
});

mobileIPhone('should display mobile layout on groups page', async ({ page }) => {
  await page.goto('/groups');
  await page.waitForLoadState('networkidle');

  const header = page.locator('h1:has-text("Groups")');
  await expect(header).toBeVisible();

  const addButton = page.getByRole('button', { name: 'Add Group' });
  await expect(addButton).toBeVisible();
});

mobileIPhone('should have accessible bottom navigation', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const bottomNav = page.locator('nav').last();
  await expect(bottomNav).toBeVisible();

  const homeLink = bottomNav.getByRole('link', { name: /home/i });
  const vocabLink = bottomNav.getByRole('link', { name: /vocabulary/i });
  const studyLink = bottomNav.getByRole('link', { name: /study/i });
  const progressLink = bottomNav.getByRole('link', { name: /progress/i });
  const settingsLink = bottomNav.getByRole('link', { name: /settings/i });

  await expect(homeLink).toBeVisible();
  await expect(vocabLink).toBeVisible();
  await expect(studyLink).toBeVisible();
  await expect(progressLink).toBeVisible();
  await expect(settingsLink).toBeVisible();
});

mobilePixel('should display mobile layout on flashcard page', async ({ page }) => {
  await page.goto('/study/flashcard');
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('.flashcard-inner', { timeout: 10000 });

  const flashcard = page.locator('.flashcard-inner');
  await expect(flashcard).toBeVisible();

  const bottomNav = page.locator('nav').last();
  await expect(bottomNav).toBeVisible();
});

mobilePixel('should display responsive stats grid', async ({ page }) => {
  await page.goto('/progress');
  await page.waitForLoadState('networkidle');

  const statsGrid = page.locator('.grid').first();
  await expect(statsGrid).toBeVisible();

  const statCards = statsGrid.locator('[data-slot="card"]');
  const count = await statCards.count();
  expect(count).toBeGreaterThan(0);
});

tabletIPad('should display tablet layout on vocabulary page', async ({ page }) => {
  await page.goto('/vocabulary');
  await page.waitForLoadState('networkidle');

  const header = page.locator('h1:has-text("Vocabulary")');
  await expect(header).toBeVisible();

  const bottomNav = page.locator('nav').last();
  await expect(bottomNav).toBeVisible();
});

tabletIPad('should display tablet layout on progress page', async ({ page }) => {
  await page.goto('/progress');
  await page.waitForLoadState('networkidle');

  const statsGrid = page.locator('.grid').first();
  await expect(statsGrid).toBeVisible();
});

mobileIPhone('should flip card when tapped on mobile', async ({ page }) => {
  await page.goto('/study/flashcard');
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('.flashcard-inner', { timeout: 10000 });

  const flashcard = page.locator('.flashcard-inner');
  await expect(flashcard).toBeVisible();

  const box = await flashcard.boundingBox();
  if (!box) {
    throw new Error('Flashcard not found');
  }

  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);

  await expect(page.getByText(/Example Sentences/i)).toBeVisible({ timeout: 5000 });
});

mobileIPhone('should navigate cards with swipe on mobile', async ({ page }) => {
  await page.goto('/study/flashcard');
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('.flashcard-inner', { timeout: 10000 });

  const progressText = page.locator('text=/Card \\d+ \\/ \\d+/');
  await expect(progressText).toBeVisible();

  const initialProgress = await progressText.textContent();

  const flashcard = page.locator('.flashcard-inner');
  const box = await flashcard.boundingBox();
  if (!box) {
    throw new Error('Flashcard not found');
  }

  await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();

  await page.waitForTimeout(500);

  const newProgress = await progressText.textContent();
  if (initialProgress && !initialProgress.includes('/ 1')) {
    expect(newProgress).not.toBe(initialProgress);
  }
});

mobileIPhone('should show flip hint on flashcard', async ({ page }) => {
  await page.goto('/study/flashcard');
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('.flashcard-inner', { timeout: 10000 });

  const hint = page.getByText(/Press Space or Click to flip/i);
  await expect(hint).toBeVisible();
});
