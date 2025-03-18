/**
 * Handles cookie pop-up consent if present
 * @param {object} page - Puppeteer page instance
 */
import { config } from '../config.js';

export const handleCookieConsent = async (page) => {
  try {
    await page.waitForSelector('button[mode="primary"]', {
      timeout: config.cookiePopupTimeout,
    });
    console.log('🛑 Cookie consent popup detected. Accepting...');

    await page.evaluate(() => {
      document.querySelector('button[mode="primary"]')?.click();
    });

    await page.waitForTimeout(config.cookiePostClickDelay);
  } catch (error) {
    console.log('✅ No cookie consent popup detected, proceeding...');
  }
};
