import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  try {
    // Retry connecting until preview server responds (timeout ~15s)
    const url = 'http://localhost:3001/';
    let connected = false;
    for (let i = 0; i < 15; i++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 2000 });
        connected = true;
        break;
      } catch (err) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }
    if (!connected) throw new Error('Could not connect to preview server at http://localhost:3001/');

    // Ensure Arabic language if toggle exists
    // Click language toggle until language is Arabic (label contains 'العربية')
    for (let i = 0; i < 3; i++) {
      const nextLang = await page.locator('button:has-text("العربية")').first();
      if (await nextLang.count() > 0) break;
      const toggle = page.locator('button:has-text("English")').first();
      if (await toggle.count() === 0) break;
      await toggle.click();
      await page.waitForTimeout(300);
    }

    // Click Generate button (green)
    const generate = page.locator('button.bg-green-600').first();
    await generate.click();
    await page.waitForTimeout(800);

    // Click Export PDF (red)
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button.bg-red-600').first().click()
    ]);

    const path = await download.path();
    if (path) {
      const out = `tests/output-${Date.now()}.pdf`;
      fs.copyFileSync(path, out);
      console.log('Downloaded PDF saved to', out);
    } else {
      console.log('Download path not available; saving suggested filename', await download.suggestedFilename());
    }

    await browser.close();
  } catch (err) {
    console.error('Test failed:', err);
    await browser.close();
    process.exit(1);
  }
})();
