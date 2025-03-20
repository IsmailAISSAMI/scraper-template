/**
 * Handles cookie pop-up consent if present
 * @param {object} page - Puppeteer page instance
 */
import { config } from '../config.js';
import { selectors } from '../selectors.js';
import { randomDelay } from '../helpers/delayHelper.js';

export const handleCookieConsent = async (page) => {
  try {
    let buttonFound = false;

    for (const selector of selectors.consentButtonSelectors) {
      const button = await page.$(selector);
      if (button) {
        console.log(
          `🛑 Cookie consent popup detected. Accepting (selector: ${selector})...`
        );
        await button.evaluate((b) => b.click());
        await randomDelay(config.minDelay || 1000, config.maxDelay || 3000); //await page.waitForTimeout(config.cookiePostClickDelay);
        buttonFound = true;
        break;
      }
    }

    if (!buttonFound) {
      console.log('✅ No cookie consent popup detected, proceeding...');
    }
  } catch (error) {
    console.error(
      '⚠️ [CookieConsentHelper.js] No cookie consent popup detected or handling failed:\n',
      error
    );
  }
};
