import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';

import { config } from '../config.js';
import { selectors } from '../selectors.js';

import { takeScreenshot } from '../helpers/screenshotHelper.js';
import { saveData, removeDuplicates } from '../helpers/dataHelper.js';
import { handleCookieConsent } from '../helpers/CookieConsentHelper.js';
import { randomDelay } from '../helpers/delayHelper.js';

/**
 * Main Avito Scraper Entrypoint
 */
export const scrapeAvitoCars = async () => {
  const startTime = Date.now();
  let browser;

  try {
    browser = await initializeBrowser();
    const page = await configurePage(browser);

    await openStartPage(page);
    await handleCookieConsent(page);

    const { cars, totalWaitTimeMs } = await scrapeRecentListings(page);
    const uniqueCars = removeDuplicates(cars);

    console.log(`✅ Extracted ${uniqueCars.length} unique recent cars`);
    await saveData('avito_cars', uniqueCars);

    if (config.captureScreenshots) {
      await takeScreenshot(page, 'screenshot');
    }

    const sec = Math.floor(totalWaitTimeMs / 1000) % 60;
    const min = Math.floor(totalWaitTimeMs / 60000);
    console.log(`🛡️ Total anti-bot wait time: ${min}m ${sec}s`);
  } catch (error) {
    console.error(`❌ Scraping failed: ${error.message}\n${error.stack}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔻 Browser closed.');
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const sec = Math.floor(durationMs / 1000) % 60;
    const min = Math.floor(durationMs / 60000);
    console.log(`⏱️ Execution time: ${min}m ${sec}s`);
  }
};

/**
 * Open initial page
 */
const openStartPage = async (page) => {
  console.log(`🚗 Opening: ${config.targetUrl}`);
  await page.goto(config.targetUrl, {
    waitUntil: 'networkidle2',
    timeout: config.navigationTimeout,
  });
};

/**
 * Scrape listings and strictly filter out "il y a 1 jour"
 */
const scrapeRecentListings = async (page) => {
  const allCars = [];
  let totalWaitTimeMs = 0;

  for (let i = 1; i <= config.paginationLimit; i++) {
    const url = i === 1 ? config.targetUrl : `${config.targetUrl}?o=${i}`;
    console.log(`📌 Scraping Page ${i}: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: config.navigationTimeout,
      });

      const carsOnPage = await extractCarsFromDOM(page);
      if (!carsOnPage.length) {
        console.warn(`⚠️ No listings on page ${i}. Stopping.`);
        break;
      }

      const has1Jour = carsOnPage.some((car) => isExactly1DayOld(car.postedAt));
      const filtered = carsOnPage.filter(
        (car) => !isExactly1DayOld(car.postedAt)
      );

      allCars.push(...filtered);
      console.log(
        `✅ Page ${i}: ${filtered.length}/${carsOnPage.length} recent cars kept`
      );

      if (has1Jour) {
        console.warn(
          `🛑 Found 'il y a 1 jour' on page ${i}. Stopping after filtering.`
        );
        break;
      }

      const waitTime = Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000;
      totalWaitTimeMs += waitTime;
      console.log(`⏳ Waiting for ${waitTime}ms to avoid detection...`);
      await new Promise((res) => setTimeout(res, waitTime));
    } catch (err) {
      console.error(`❌ Error scraping page ${i}: ${err.message}`);
      break;
    }
  }

  return { cars: allCars, totalWaitTimeMs };
};

/**
 * Extract all car listings from a page
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
        const postedAt = ad.querySelector('p.layWaX')?.innerText?.trim() || '';

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
          postedAt,
        };
      })
      .filter(Boolean);
  }, selectors);
};

/**
 * Check if postedAt is exactly "il y a 1 jour"
 */
const isExactly1DayOld = (label) => {
  if (!label) return false;
  const l = label.toLowerCase().trim();
  return l === 'il y a 1 jour';
};
