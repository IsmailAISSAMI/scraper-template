import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';
import { config } from '../config.js';
import { takeScreenshot } from '../helpers/screenshotHelper.js';
import { saveData, removeDuplicates } from '../helpers/dataHelper.js';
import { handleCookieConsent } from '../helpers/CookieConsentHelper.js';

/**
 * Scrapes car listings from Avito.ma
 * @returns {Promise<void>}
 */
export const scrapeAvitoCars = async () => {
  let browser;

  try {
    browser = await initializeBrowser();
    const page = await configurePage(browser);

    console.log(`🚗 Navigating to Avito.ma: ${config.targetUrl}`);
    await page.goto(config.targetUrl, {
      waitUntil: 'networkidle2',
      timeout: config.navigationTimeout,
    });

    await handleCookieConsent(page);

    let cars = await extractCarData(page);
    cars = removeDuplicates(cars);

    console.log(`✅ Extracted ${cars.length} cars from Avito.ma`);

    await saveData('avito_cars', cars);

    if (config.captureScreenshots) {
      await takeScreenshot(page, 'screenshot');
    }
  } catch (error) {
    console.error(
      `❌ Scraping failed: ${error.message}\nStack Trace: ${error.stack}`
    );
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔻 Browser closed.');
    }
  }
};

/**
 * Extracts car listing data from the page
 * @param {object} page - Puppeteer page instance
 * @returns {Promise<Array>} - Extracted car data
 */
const extractCarData = async (page) => {
  return await page.evaluate(() => {
    return [
      ...document.querySelectorAll(
        '.sc-1nre5ec-1.crKvIr.listing a.sc-1jge648-0'
      ),
    ]
      .map((ad) => {
        const getText = (selector) =>
          ad.querySelector(selector)?.innerText?.trim() || 'N/A';
        return {
          title: getText('.sc-1x0vz2r-0.iHApav'),
          price: getText('.sc-1x0vz2r-0.dJAfqm'),
          location: getText('.sc-1x0vz2r-0.layWaX'),
          year: getText('[title="Année-Modèle"] span'),
          transmission: getText('[title="Boite de vitesses"] span'),
          fuel: getText('[title="Type de carburant"] span'),
          image: ad.querySelector('img.sc-bsm2tm-3')?.src || '',
          link: ad.href.startsWith('http')
            ? ad.href
            : `https://www.avito.ma${ad.getAttribute('href')}`,
        };
      })
      .filter((car) => car.title !== 'N/A');
  });
};
