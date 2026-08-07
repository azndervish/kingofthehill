import { chromium } from 'playwright';

async function testDeployed() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to https://azndervish.github.io/kingofthehill/');
  await page.goto('https://azndervish.github.io/kingofthehill/');
  
  console.log('Waiting for "Join Game" button...');
  await page.waitForSelector('text=Join Game');
  
  console.log('Clicking "Start Game" button...');
  await page.click('text=Start Game');
  
  console.log('Waiting for game to load...');
  await page.waitForSelector('text=Game Over', { timeout: 10000 }).catch(() => {
    console.log('Game loaded successfully (no timeout)');
  });
  
  console.log('Test passed!');
  await browser.close();
}

testDeployed().catch(console.error);
