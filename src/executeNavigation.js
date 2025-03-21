import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';
import { config } from '../config.js';

/**
 * Securely navigates to a specified URL using Puppeteer with stealth configurations.
 *
 * @param {string} url - The URL to navigate to. Defaults securely from environment configuration.
 * @param {number} timeout - Navigation timeout in milliseconds. Defaults securely from environment configuration.
 * @returns {Promise<void>} - Completes when navigation succeeds or fails gracefully.
 */
export const executeNavigation = async (
  url = config.targetUrl,
  timeout = config.navigationTimeout
) => {
  let browser;

  try {
    console.log(`✅ [executeNavigation.js] Initializing browser...`);

    browser = await initializeBrowser();
    const page = await configurePage(browser);

    console.log(`🛰️ [executeNavigation.js] Navigating securely to: ${url}`);

    await page.goto(url, {
      waitUntil: 'load',
      timeout,
    });

    console.log(`✅ [executeNavigation.js] Successfully navigated to: ${url}`);
  } catch (error) {
    console.error(
      `❌ [executeNavigation.js] Navigation error: ${error.message}\nStack Trace: ${error.stack}`
    );
  } finally {
    if (browser) {
      await browser.close();
      console.log(
        `🔻 [executeNavigation.js] Browser instance securely closed.`
      );
    }
  }
};
