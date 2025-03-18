import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';

import { config } from '../config.js';
import { selectors } from '../selectors.js';

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
  return await page.evaluate((selectors) => {
    try {
      console.log('🚀 Running extractCarData...');

      // Ensure the container exists before extracting data
      const container = document.querySelectorAll(selectors.listingContainer);
      if (!container.length) {
        console.error('❌ ERROR: No listings found! Check selectors.');
        return [];
      }

      const getText = (ad, selector) => {
        try {
          return ad.querySelector(selector)?.innerText?.trim() || null;
        } catch (err) {
          console.error(`❌ Error extracting: ${selector}`, err);
          return null;
        }
      };

      const formatPrice = (price) => {
        if (!price || price.includes('Prix non spécifié')) return null;
        const numericPrice = price.replace(/[^\d]/g, '');
        return numericPrice ? Number(numericPrice) : null;
      };

      const validateYear = (year) => {
        if (!year || isNaN(year)) return null;
        const numYear = Number(year);
        const currentYear = new Date().getFullYear();
        return numYear >= 1900 && numYear <= currentYear ? numYear : null;
      };

      const normalizeField = (value) => {
        const invalidValues = ['N/A', '-', 'Unknown', 'Indisponible', ''];
        return invalidValues.includes(value) ? null : value;
      };

      const cars = [...container]
        .map((ad) => {
          return {
            title: getText(ad, selectors.title),
            price: formatPrice(getText(ad, selectors.price)),
            location: getText(ad, selectors.location)
              .replace("Voitures d'occasion dans ", '')
              .replace('Voitures de location dans ', '')
              .trim(),
            year: validateYear(getText(ad, selectors.year)),
            transmission: normalizeField(getText(ad, selectors.transmission)),
            fuel: normalizeField(getText(ad, selectors.fuel)),
            image: ad.querySelector(selectors.image)?.src || '',
            link: ad.href.startsWith('http')
              ? ad.href
              : `https://www.avito.ma${ad.getAttribute('href')}`,
          };
        })
        .filter((car) => car.title !== null);

      console.log('📌 Extracted Cars:', cars);
      return cars;
    } catch (error) {
      console.error('❌ Error extracting car data', error);
      return [];
    }
  }, selectors);
};
