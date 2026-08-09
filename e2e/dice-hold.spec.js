import { test, expect } from '@playwright/test';

test.describe('dice hold (reroll) bug', () => {
  // use seeded URL so rolls are deterministic
  const seed = 'dice-bug-seed-99';

  test('initial dice are unchecked and first click checks immediately', async ({ page }) => {
    await page.goto(`./?seed=${seed}`);
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.die')).toHaveCount(6, { timeout: 5000 });

    const boxes = page.locator('.die input[type="checkbox"]');
    await expect(boxes).toHaveCount(6);

    // Before fix: UI shows unchecked (pass) but internal state is checked=true.
    // So first click toggles true->false but UI stays unchecked -> FAILS next assertion.
    // After fix: state false matches UI false, first click false->true => checked.
    for (let i = 0; i < 6; i++) {
      await expect(boxes.nth(i)).not.toBeChecked();
      const visual = await page.evaluate((idx) => document.querySelectorAll('.die')[idx].innerHTML.includes('Mui-checked'), i);
      expect(visual).toBe(false);
    }

    // Click die 2 – must become checked on FIRST click (visually and DOM)
    await page.locator('.die').nth(2).click();
    await expect(boxes.nth(2)).toBeChecked();
    expect(await page.evaluate(() => document.querySelectorAll('.die')[2].innerHTML.includes('Mui-checked'))).toBe(true);

    // Second click should uncheck again (round-trip)
    await page.locator('.die').nth(2).click();
    await expect(boxes.nth(2)).not.toBeChecked();
    expect(await page.evaluate(() => document.querySelectorAll('.die')[2].innerHTML.includes('Mui-checked'))).toBe(false);
  });

  test('Reroll Unchecked with no holds must reroll (not silently keep all)', async ({ page }) => {
    await page.goto(`./?seed=reroll-all-${seed}`);
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.die')).toHaveCount(6);

    const getDiceTexts = async () =>
      (await page.locator('.die').allTextContents()).map(t => t.trim());

    const boxes = page.locator('.die input[type="checkbox"]');
    for (let i = 0; i < 6; i++) await expect(boxes.nth(i)).not.toBeChecked();

    const before = await getDiceTexts();
    // No dice held, so "Reroll Unchecked" should reroll all 6.
    // Before fix: internal state is all checked => reroll keeps all => before==after (bug)
    await page.getByRole('button', { name: 'Reroll Unchecked' }).click();
    // handleReroll delays onGameUpdate 100ms + re-render
    await page.waitForTimeout(300);
    const after = await getDiceTexts();
    // At least one die should have changed (probabilistic but with seed, all rerolled)
    expect(after).not.toEqual(before);
  });

  test('hold dice 2 and 4 → after reroll they move to 0,1 and stay checked', async ({ page }) => {
    await page.goto(`./?seed=hold-front-${seed}`);
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.die')).toHaveCount(6);

    const dice = page.locator('.die');
    const boxes = page.locator('.die input[type="checkbox"]');

    // Ensure clean start: all unchecked
    for (let i = 0; i < 6; i++) await expect(boxes.nth(i)).not.toBeChecked();

    const beforeTexts = (await dice.allTextContents()).map(t => t.trim());
    const val2 = beforeTexts[2];
    const val4 = beforeTexts[4];
    console.log(`before ${JSON.stringify(beforeTexts)} hold 2:${val2} 4:${val4}`);

    // Check dice 2 and 4 (hold them)
    await dice.nth(2).click();
    await dice.nth(4).click();
    await expect(boxes.nth(2)).toBeChecked();
    await expect(boxes.nth(4)).toBeChecked();
    // others remain unchecked
    await expect(boxes.nth(0)).not.toBeChecked();
    await expect(boxes.nth(1)).not.toBeChecked();

    await page.getByRole('button', { name: 'Reroll Unchecked' }).click();
    await page.waitForTimeout(300);

    const afterTexts = (await dice.allTextContents()).map(t => t.trim());
    const afterChecks = [];
    for (let i = 0; i < 6; i++) afterChecks.push(await boxes.nth(i).isChecked());

    console.log(`after ${JSON.stringify(afterTexts)} checks ${JSON.stringify(afterChecks)}`);

    // Held dice values must have moved to front (0,1) via front-concat
    expect(afterTexts[0]).toBe(val2);
    expect(afterTexts[1]).toBe(val4);
    // And their hold checkboxes must stay checked at new positions
    expect(afterChecks[0]).toBe(true);
    expect(afterChecks[1]).toBe(true);
    // Unheld positions must be unchecked
    for (let i = 2; i < 6; i++) expect(afterChecks[i]).toBe(false);

    // Visual Mui-checked must match DOM checked (catches key-reuse bug where
    // input.checked is correct but Mui-checked class sticks to old index)
    const visualChecks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.die')).map(el => el.innerHTML.includes('Mui-checked'))
    );
    for (let i = 0; i < 6; i++) expect(visualChecks[i]).toBe(afterChecks[i]);
  });

  test('hold single die 4 → after reroll die 0 shows checked and die 4 unchecked (visual sync)', async ({ page }) => {
    await page.goto(`./?seed=hold-single-4-${seed}`);
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.die')).toHaveCount(6);
    const dice = page.locator('.die');
    const boxes = page.locator('.die input[type="checkbox"]');
    for (let i = 0; i < 6; i++) await expect(boxes.nth(i)).not.toBeChecked();

    const beforeTexts = (await dice.allTextContents()).map(t => t.trim());
    const holdVal = beforeTexts[4];
    await dice.nth(4).click();
    await expect(boxes.nth(4)).toBeChecked();
    expect(await page.evaluate(() => document.querySelectorAll('.die')[4].innerHTML.includes('Mui-checked'))).toBe(true);

    await page.getByRole('button', { name: 'Reroll Unchecked' }).click();
    await page.waitForTimeout(300);

    const afterTexts = (await dice.allTextContents()).map(t => t.trim());
    expect(afterTexts[0]).toBe(holdVal);
    // Die 0 must be checked visually and DOM, die 4 must be unchecked
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(4)).not.toBeChecked();
    expect(await page.evaluate(() => document.querySelectorAll('.die')[0].innerHTML.includes('Mui-checked'))).toBe(true);
    expect(await page.evaluate(() => document.querySelectorAll('.die')[4].innerHTML.includes('Mui-checked'))).toBe(false);

    // First click on die 0 must uncheck (not require two clicks)
    await dice.nth(0).click();
    await expect(boxes.nth(0)).not.toBeChecked();
    expect(await page.evaluate(() => document.querySelectorAll('.die')[0].innerHTML.includes('Mui-checked'))).toBe(false);
    // First click on die 4 must check
    await dice.nth(4).click();
    await expect(boxes.nth(4)).toBeChecked();
    expect(await page.evaluate(() => document.querySelectorAll('.die')[4].innerHTML.includes('Mui-checked'))).toBe(true);
  });

  test('second reroll keeps previous holds at front', async ({ page }) => {
    // Verifies that after first reroll the newKeep [T,T,F,F,F,F] is used correctly
    await page.goto(`./?seed=second-reroll-${seed}`);
    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.die')).toHaveCount(6);
    const dice = page.locator('.die');
    const boxes = page.locator('.die input[type="checkbox"]');
    await dice.nth(0).click(); // hold 0
    await expect(boxes.nth(0)).toBeChecked();
    await page.getByRole('button', { name: 'Reroll Unchecked' }).click();
    await page.waitForTimeout(300);
    // After first reroll, held die should be at 0 and stay checked
    await expect(boxes.nth(0)).toBeChecked();
    const visual1 = await page.evaluate(() => Array.from(document.querySelectorAll('.die')).map(el => el.innerHTML.includes('Mui-checked')));
    expect(visual1[0]).toBe(true);
    // Hold an additional die (now at index 2) and reroll again
    await dice.nth(2).click();
    await expect(boxes.nth(2)).toBeChecked();
    const beforeSecond = (await dice.allTextContents()).map(t => t.trim());
    const hold0 = beforeSecond[0];
    const hold2 = beforeSecond[2];
    await page.getByRole('button', { name: 'Reroll Unchecked' }).click();
    await page.waitForTimeout(300);
    const afterSecond = (await dice.allTextContents()).map(t => t.trim());
    // Both held values should now be at 0,1
    expect(afterSecond[0]).toBe(hold0);
    expect(afterSecond[1]).toBe(hold2);
  });
});
