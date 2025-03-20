import fs from 'fs';
import path from 'path';

/**
 * Takes a screenshot and saves it in the screenshots folder.
 * @param {Object} page - Puppeteer page object.
 * @param {string} name - The name of the screenshot file.
 */
export const takeScreenshot = async (page, name) => {
  const screenshotsDir = './screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Generate timestamped file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(screenshotsDir, `${name}_${timestamp}.png`);

  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`📸 Screenshot saved: ${screenshotPath}`);

  return screenshotPath;
};
