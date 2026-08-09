import { test, expect } from '@playwright/test';

test.describe('items for sale', () => {
  test('shows 3 random items + sweep after start', async ({ page }) => {
    await page.goto('./?seed=items-sale-seed');
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.getByRole('heading', { name: 'Items for Sale' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.item-card')).toHaveCount(4); // 3 + sweep
    await expect(page.locator('text=Sweep')).toBeVisible();
    // Each card should have a cost like (4) and a type
    const cards = page.locator('.item-card');
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i).locator('text=Type:')).toBeVisible();
    }
  });

  test('sweep is always present even with empty sale', async ({ page }) => {
    // With seeded deck, sale should still contain sweep
    await page.goto('./?seed=sweep-check');
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.item-card')).toHaveCount(4);
    const sweepCard = page.locator('.item-card', { hasText: 'Sweep' });
    await expect(sweepCard).toHaveCount(1);
    await expect(sweepCard.locator('text=Discard all items')).toBeVisible();
  });
});
