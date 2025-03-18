import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';

import { config } from '../config.js';
import { selectors } from '../selectors.js';

import { takeScreenshot } from '../helpers/screenshotHelper.js';
import { saveData, removeDuplicates } from '../helpers/dataHelper.js';
import { handleCookieConsent } from '../helpers/CookieConsentHelper.js';
import { randomDelay } from '../helpers/delayHelper.js';

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
 * Extracts car data from multiple pages and stores it in a single variable.
 * @param {object} page - Puppeteer page instance.
 * @returns {Promise<Array>} - Extracted car data from all pages.
 */
export const extractCarData = async (page) => {
  let allCars = [];

  console.log(
    `🚀 Scraping car listings from pages 1 to ${config.paginationLimit}...`
  );

  for (
    let currentPage = 1;
    currentPage <= config.paginationLimit;
    currentPage++
  ) {
    const url =
      currentPage === 1
        ? config.targetUrl
        : `${config.targetUrl}?o=${currentPage}`;
    console.log(`📌 Navigating to Page ${currentPage}: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: config.navigationTimeout,
      });

      const cars = await page.evaluate((selectors) => {
        try {
          console.log('🚀 Running extractCarData...');

          const container = document.querySelectorAll(
            selectors.listingContainer
          );
          if (!container.length) {
            console.warn('⚠️ No listings found on this page. Stopping...');
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

          return [...container]
            .map((ad) => ({
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
            }))
            .filter((car) => car.title !== null);
        } catch (error) {
          console.error('❌ Error extracting car data', error);
          return [];
        }
      }, selectors);

      if (cars.length === 0) {
        console.warn(
          `⚠️ No more listings found on page ${currentPage}, stopping pagination.`
        );
        break;
      }

      console.log(`✅ Extracted ${cars.length} cars from Page ${currentPage}`);
      allCars.push(...cars);

      await randomDelay(20000, 30000);
    } catch (error) {
      console.error(`❌ Error scraping Page ${currentPage}:`, error);
      break;
    }
  }

  console.log(`📦 Total cars extracted: ${allCars.length}`);
  await saveData('avito_cars', allCars);
  return allCars;
};
