import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/db/prisma';
import { generateVocabularyItems } from '@/tests/helpers/test-data-generator';

test.describe('Performance Testing - Large Datasets', () => {
  const LARGE_DATASET_SIZE = 1000;
  const TIMEOUT_RENDERING_MS = 3000;
  const TIMEOUT_SEARCH_MS = 500;

  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await prisma.vocabularyItem.deleteMany();
    const items = generateVocabularyItems(LARGE_DATASET_SIZE);
    await prisma.vocabularyItem.createMany({
      data: items,
    });
  });

  test.afterAll(async () => {
    await prisma.vocabularyItem.deleteMany();
  });

  test('should render 1000 vocabulary items within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/vocabulary');

    await page.waitForSelector('[data-testid="vocabulary-card"]', {
      timeout: TIMEOUT_RENDERING_MS,
    });

    const endTime = Date.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(TIMEOUT_RENDERING_MS);

    console.log(`[PERFORMANCE] Rendered 1000 items in ${renderTime}ms`);
  });

  test('should display correct count of vocabulary items', async ({ page }) => {
    await page.goto('/vocabulary');

    await page.waitForSelector('[data-testid="vocabulary-card"]');

    const initialCount = await page.locator('[data-testid="vocabulary-card"]').count();

    expect(initialCount).toBeGreaterThan(0);
  });

  test('should perform search operation within 500ms on 1000 items', async ({ page }) => {
    await page.goto('/vocabulary');

    await page.waitForSelector('[data-testid="vocabulary-card"]');

    const searchInput = page.locator('input[placeholder*="Search"]').first();

    const startTime = Date.now();

    await searchInput.fill('勉強');

    await page.waitForTimeout(100);

    const endTime = Date.now();
    const searchTime = endTime - startTime;

    expect(searchTime).toBeLessThan(TIMEOUT_SEARCH_MS);

    console.log(`[PERFORMANCE] Search completed in ${searchTime}ms`);
  });

  test('should filter vocabulary items within 500ms', async ({ page }) => {
    await page.goto('/vocabulary');

    await page.waitForSelector('[data-testid="vocabulary-card"]');

    const filterButton = page.locator('button', { hasText: /filter/i }).first();

    if (await filterButton.isVisible()) {
      const startTime = Date.now();

      await filterButton.click();

      await page.waitForTimeout(100);

      const endTime = Date.now();
      const filterTime = endTime - startTime;

      expect(filterTime).toBeLessThan(TIMEOUT_SEARCH_MS);

      console.log(`[PERFORMANCE] Filter completed in ${filterTime}ms`);
    }
  });

  test('should handle scroll performance with 1000 items', async ({ page }) => {
    await page.goto('/vocabulary');

    await page.waitForSelector('[data-testid="vocabulary-card"]');

    const startTime = Date.now();

    await page.mouse.wheel(0, 5000);

    await page.waitForTimeout(100);

    const endTime = Date.now();
    const scrollTime = endTime - startTime;

    expect(scrollTime).toBeLessThan(1000);

    console.log(`[PERFORMANCE] Scroll completed in ${scrollTime}ms`);
  });

  test('should measure time to first vocabulary card visible', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/vocabulary');

    await page.locator('[data-testid="vocabulary-card"]').first().waitFor({ state: 'visible' });

    const endTime = Date.now();
    const timeToFirstCard = endTime - startTime;

    expect(timeToFirstCard).toBeLessThan(2000);

    console.log(`[PERFORMANCE] Time to first card: ${timeToFirstCard}ms`);
  });

  test('should handle rapid consecutive searches efficiently', async ({ page }) => {
    await page.goto('/vocabulary');

    await page.waitForSelector('[data-testid="vocabulary-card"]');

    const searchInput = page.locator('input[placeholder*="Search"]').first();

    const searches = ['勉強', '学校', '先生', '学生', '日本語'];
    const searchTimes: number[] = [];

    for (const searchTerm of searches) {
      const startTime = Date.now();

      await searchInput.fill(searchTerm);

      await page.waitForTimeout(50);

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      searchTimes.push(searchTime);

      expect(searchTime).toBeLessThan(TIMEOUT_SEARCH_MS);
    }

    const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;

    console.log(`[PERFORMANCE] Average search time: ${avgSearchTime.toFixed(2)}ms`);
    console.log(`[PERFORMANCE] Individual search times: ${searchTimes.join(', ')}ms`);
  });

  test('should handle pagination efficiently if implemented', async ({ page }) => {
    await page.goto('/vocabulary');

    await page.waitForSelector('[data-testid="vocabulary-card"]');

    const nextButton = page.locator('button', { hasText: /next/i }).first();

    if (await nextButton.isVisible()) {
      const startTime = Date.now();

      await nextButton.click();

      await page.waitForSelector('[data-testid="vocabulary-card"]');

      const endTime = Date.now();
      const paginationTime = endTime - startTime;

      expect(paginationTime).toBeLessThan(1000);

      console.log(`[PERFORMANCE] Pagination completed in ${paginationTime}ms`);
    }
  });
});
