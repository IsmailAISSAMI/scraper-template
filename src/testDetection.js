import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';
import fs from 'fs';
import path from 'path';

const detectionSites = [
  { name: 'Sannysoft', url: 'https://bot.sannysoft.com/' },
  {
    name: 'DeviceAndBrowserInfo',
    url: 'https://deviceandbrowserinfo.com/are_you_a_bot',
  },
];

/**
 * Runs stealth detection tests securely on multiple sites and captures screenshots safely.
 * Screenshots are stored securely, timestamped, and never committed to repositories.
 */
export const testDetection = async () => {
  let browser;

  const screenshotsDir = './screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  try {
    browser = await initializeBrowser();
    const page = await configurePage(browser);

    for (const site of detectionSites) {
      console.log(
        `[${new Date().toISOString()}] 🔍 Testing stealth at: ${site.name}`
      );

      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 60000 });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(
        screenshotsDir,
        `detection_test_${site.name}_${timestamp}.png`
      );

      await page.screenshot({ path: screenshotPath });
      console.log(`✅ Screenshot securely saved: ${screenshotPath}`);
    }
  } catch (error) {
    console.error(
      `❌ Detection test failed: ${error.message}\nStack Trace: ${error.stack}`
    );
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔻 Browser instance securely closed.');
    }
  }
};
