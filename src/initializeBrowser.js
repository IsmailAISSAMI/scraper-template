import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config } from '../config.js';

puppeteer.use(StealthPlugin());

/**
 * Initializes and securely launches a Puppeteer browser instance.
 * @returns {Promise<puppeteer.Browser>} Puppeteer browser instance.
 */
export const initializeBrowser = async () => {
  return puppeteer.launch({
    headless: config.headless,
    args: [
      // SECURITY & SANDBOXING
      //'--no-sandbox', // Only if necessary (e.g., in Docker)
      //'--disable-setuid-sandbox', // Only if necessary

      // STEALTH & ANTI-DETECTION
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--disable-extensions',

      // RESOURCE MANAGEMENT
      '--disable-gpu',
      '--disable-dev-shm-usage',

      // NETWORK & SECURITY ENHANCEMENTS
      '--disable-background-networking',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-domain-reliability',
      '--disable-sync',
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',

      // PRIVACY & DATA PROTECTION
      '--password-store=basic',
      '--use-mock-keychain',
    ],
    defaultViewport: null,
  });
};
