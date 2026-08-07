import { firefox } from 'playwright';

async function testLocal() {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', err => console.log('Page error:', err));
  
  console.log('Navigating to http://localhost:5173/kingofthehill/');
  await page.goto('http://localhost:5173/kingofthehill/');
  
  console.log('Waiting for "Start Game" button...');
  await page.waitForSelector('button:has-text("Start Game")');
  
  console.log('Clicking "Start Game" button...');
  await page.click('button:has-text("Start Game")');
  
  console.log('Waiting for game to load...');
  await page.waitForTimeout(5000);
  
  const bodyClass = await page.evaluate(() => document.body.className);
  console.log('Body class:', bodyClass);
  
  const gameElements = await page.$$('div.game-component');
  console.log('Found', gameElements.length, 'game-component elements');
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log('Body HTML length:', html.length);
  console.log('Body HTML (first 500 chars):', html.substring(0, 500));
  
  if (bodyClass.includes('white') || bodyClass === '' || html.length < 100) {
    console.log('WARNING: Screen appears to be white - potential rendering issue');
  }
  
  await browser.close();
}

testLocal().catch(console.error);
