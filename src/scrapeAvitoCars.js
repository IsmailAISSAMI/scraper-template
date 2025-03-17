import fs from 'fs';
import path from 'path';
import { initializeBrowser } from './initializeBrowser.js';
import { configurePage } from './configurePage.js';
import { config } from '../config.js';
import { takeScreenshot } from '../helpers/screenshotHelper.js';
import { saveData } from '../helpers/dataHelper.js';

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

    try {
      await page.waitForSelector('button[mode="primary"]', { timeout: 5000 });
      console.log('🛑 Cookie consent popup detected. Accepting...');
      await page.click('button[mode="primary"]');
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('✅ No cookie consent popup detected, proceeding...');
    }

    let cars = await page.evaluate(() => {
      const listings = [];
      document
        .querySelectorAll('.sc-1nre5ec-1.crKvIr.listing a.sc-1jge648-0')
        .forEach((ad) => {
          const title = ad
            .querySelector('.sc-1x0vz2r-0.iHApav')
            ?.innerText?.trim();
          const price = ad
            .querySelector('.sc-1x0vz2r-0.dJAfqm')
            ?.innerText?.trim();
          const location = ad
            .querySelector('.sc-1x0vz2r-0.layWaX')
            ?.innerText?.trim();
          const year = ad
            .querySelector('[title="Année-Modèle"] span')
            ?.innerText?.trim();
          const transmission = ad
            .querySelector('[title="Boite de vitesses"] span')
            ?.innerText?.trim();
          const fuel = ad
            .querySelector('[title="Type de carburant"] span')
            ?.innerText?.trim();
          const image = ad.querySelector('img.sc-bsm2tm-3')?.src;
          const link = ad.href.startsWith('http')
            ? ad.href
            : `https://www.avito.ma${ad.getAttribute('href')}`;

          if (
            title &&
            price &&
            location &&
            year &&
            transmission &&
            fuel &&
            image &&
            link
          ) {
            listings.push({
              title,
              price,
              location,
              year,
              transmission,
              fuel,
              image,
              link,
            });
          }
        });
      return listings;
    });

    // Removing duplicate
    cars = Array.from(new Set(cars.map((car) => JSON.stringify(car)))).map(
      (str) => JSON.parse(str)
    );

    console.log(`✅ Extracted ${cars.length} cars from Avito.ma`);

    await saveData('avito_cars', cars);
    await takeScreenshot(page, 'screenshot');
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
