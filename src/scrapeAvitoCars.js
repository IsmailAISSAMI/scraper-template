import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';

import { config } from '../config.js';
import { selectors } from '../selectors.js';

import { takeScreenshot } from '../helpers/screenshotHelper.js';
import { saveData, removeDuplicates } from '../helpers/dataHelper.js';
import { handleCookieConsent } from '../helpers/CookieConsentHelper.js';
import { randomDelay } from '../helpers/delayHelper.js';

/**
 * Entry point: scrape all car listings from Avito.ma
 */
export const scrapeAvitoCars = async () => {
  let browser;

  try {
    browser = await initializeBrowser();
    const page = await configurePage(browser);

    await openStartPage(page);
    await handleCookieConsent(page);

    const cars = await runPagination(page);
    const uniqueCars = removeDuplicates(cars);

    console.log(`✅ Extracted ${uniqueCars.length} unique cars`);
    await saveData('avito_cars', uniqueCars);

    if (config.captureScreenshots) {
      await takeScreenshot(page, 'screenshot');
    }
  } catch (error) {
    console.error(`❌ Scraping failed: ${error.message}\n${error.stack}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔻 Browser closed.');
    }
  }
};

/**
 * Opens the initial page
 */
const openStartPage = async (page) => {
  console.log(`🚗 Opening: ${config.targetUrl}`);
  await page.goto(config.targetUrl, {
    waitUntil: 'networkidle2',
    timeout: config.navigationTimeout,
  });
};

/**
 * Handles multi-page data extraction
 */
const runPagination = async (page) => {
  const allCars = [];

  for (let i = 1; i <= config.paginationLimit; i++) {
    const url = i === 1 ? config.targetUrl : `${config.targetUrl}?o=${i}`;
    console.log(`📌 Page ${i}: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: config.navigationTimeout,
      });

      const carsOnPage = await extractCarsFromDOM(page);
      if (!carsOnPage.length) {
        console.warn(`⚠️ No listings on page ${i}. Exiting pagination.`);
        break;
      }

      console.log(`✅ Found ${carsOnPage.length} cars`);
      allCars.push(...carsOnPage);

      await randomDelay(20000, 30000);
    } catch (err) {
      console.error(`❌ Error on page ${i}: ${err.message}`);
      break;
    }
  }

  console.log(`📦 Total cars collected: ${allCars.length}`);
  return allCars;
};

/**
 * Executes DOM extraction in the browser context
 */
const extractCarsFromDOM = async (page) => {
  return page.evaluate((selectors) => {
    const ads = document.querySelectorAll(selectors.listingContainer);
    if (!ads.length) return [];

    const invalid = ['N/A', '-', 'Unknown', 'Indisponible', ''];

    const parsePrice = (text) => {
      if (!text || text.includes('Prix non spécifié')) return null;
      return Number(text.replace(/[^\d]/g, '')) || null;
    };

    const parseYear = (text) => {
      const y = Number(text);
      const now = new Date().getFullYear();
      return y >= 1900 && y <= now ? y : null;
    };

    const getText = (el, sel) =>
      el.querySelector(sel)?.innerText?.trim() || null;

    return Array.from(ads)
      .map((ad) => {
        const href = ad.getAttribute('href') || '';
        const image = ad.querySelector(selectors.image)?.src || '';

        const title = getText(ad, selectors.title);
        if (!title) return null;

        return {
          title,
          price: parsePrice(getText(ad, selectors.price)),
          location:
            getText(ad, selectors.location)
              ?.replace("Voitures d'occasion dans ", '')
              ?.replace('Voitures de location dans ', '')
              ?.trim() || null,
          year: parseYear(getText(ad, selectors.year)),
          transmission: invalid.includes(getText(ad, selectors.transmission))
            ? null
            : getText(ad, selectors.transmission),
          fuel: invalid.includes(getText(ad, selectors.fuel))
            ? null
            : getText(ad, selectors.fuel),
          image,
          link: href.startsWith('http') ? href : `https://www.avito.ma${href}`,
        };
      })
      .filter(Boolean);
  }, selectors);
};
