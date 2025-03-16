import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';

const detectionSites = [
  { name: 'Sannysoft', url: 'https://bot.sannysoft.com/' },
  {
    name: 'DeviceAndBrowserInfo',
    url: 'https://deviceandbrowserinfo.com/are_you_a_bot',
  },
];

/**
 * Runs bot detection tests on multiple sites and captures screenshots.
 * @returns {Promise<void>}
 */
export const testDetection = async () => {
  let browser;

  try {
    browser = await initializeBrowser();
    const page = await configurePage(browser);

    for (const site of detectionSites) {
      console.log(`🔍 Running bot detection test at: ${site.name}`);

      await page.goto(site.url, { waitUntil: 'networkidle2' });

      // Take a screenshot of each test
      const screenshotPath = `detection_test_${site.name}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
    }
  } catch (error) {
    console.error(`❌ Bot detection test failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔻 Browser closed.');
    }
  }
};
