/**
 * Handles cookie pop-up consent if present
 * @param {object} page - Puppeteer page instance
 */
export const handleCookieConsent = async (page) => {
  try {
    await page.waitForSelector('button[mode="primary"]', { timeout: 5000 });
    console.log('🛑 Cookie consent popup detected. Accepting...');
    await page.evaluate(() => {
      document.querySelector('button[mode="primary"]')?.click();
    });
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('✅ No cookie consent popup detected, proceeding...');
  }
};
