import { test, expect } from '@playwright/test';

test.describe('reroll end and turn reset', () => {
  test('Reroll button shows count and disables after last reroll, then auto-keeps', async ({ page }) => {
    await page.goto('./?seed=reroll-auto');
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.die')).toHaveCount(6);

    // Initially 2 rerolls
    await expect(page.getByRole('button', { name: /Reroll Unchecked \(2\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reroll/ })).toBeEnabled();

    // Hold one die and do first reroll
    await page.locator('.die').nth(0).click();
    await page.getByRole('button', { name: /Reroll Unchecked \(2\)/ }).click();
    await page.waitForTimeout(400);
    await expect(page.getByRole('button', { name: /Reroll Unchecked \(1\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reroll/ })).toBeEnabled();

    // Second (last) reroll – should auto-apply to buy phase
    await page.locator('.die').nth(1).click();
    await page.getByRole('button', { name: /Reroll Unchecked \(1\)/ }).click();
    // After last reroll, Reroll should become disabled briefly then game goes to BUY
    await expect(page.getByRole('button', { name: /No rerolls left/ })).toBeVisible({ timeout: 2000 });
    // Auto-keep should transition to End Turn (buy phase) within ~1s
    await expect(page.getByRole('button', { name: 'End Turn' })).toBeVisible({ timeout: 2000 });
    // Dice should now be without checkboxes (buy phase)
    await expect(page.locator('.die input[type="checkbox"]')).toHaveCount(0);
  });

  test('next turn resets dice to all unchecked', async ({ page }) => {
    await page.goto('./?seed=turn-reset-e2e');
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.die')).toHaveCount(6);

    // Hold some dice and go through a full turn
    await page.locator('.die').nth(0).click();
    await page.locator('.die').nth(3).click();
    await expect(page.locator('.die input[type="checkbox"]').nth(0)).toBeChecked();
    await page.getByRole('button', { name: /Reroll/ }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Keep All Dice' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: 'End Turn' })).toBeVisible();
    await page.getByRole('button', { name: 'End Turn' }).click();
    // Wait for bot turn to finish and return to human (human vs bot, bot takes ~1s)
    await page.waitForTimeout(2500);
    await expect(page.locator('.die')).toHaveCount(6);
    // New turn should be all unchecked and 2 rerolls again
    for (let i = 0; i < 6; i++) {
      await expect(page.locator('.die input[type="checkbox"]').nth(i)).not.toBeChecked();
    }
    await expect(page.getByRole('button', { name: /Reroll Unchecked \(2\)/ })).toBeVisible();
  });

  test('clicking Reroll when disabled does nothing', async ({ page }) => {
    await page.goto('./?seed=reroll-disabled');
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.die')).toHaveCount(6);
    // Use both rerolls quickly
    await page.getByRole('button', { name: /Reroll/ }).click(); // 2->1
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Reroll/ }).click(); // 1->0 and auto-apply
    await page.waitForTimeout(800);
    // Now in buy phase, Reroll should not be visible
    await expect(page.getByRole('button', { name: /Reroll/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'End Turn' })).toBeVisible();
  });
});
