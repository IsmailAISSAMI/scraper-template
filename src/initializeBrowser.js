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
      '--no-sandbox',
      '--disable-setuid-sandbox',

      // STEALTH & ANTI-DETECTION
      '--disable-blink-features=AutomationControlled',
      '--disable-site-isolation-trials',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-infobars',
      '--disable-extensions',

      // RESOURCE MANAGEMENT
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',

      // NETWORK & SECURITY ENHANCEMENTS
      '--disable-background-networking',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-domain-reliability',
      '--disable-sync',
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',

      // WEBRTC & FINGERPRINT PROTECTION
      '--disable-features=IsolateOrigins,site-per-process',
      //'--disable-web-security', // Use with caution
      '--disable-accelerated-2d-canvas',
      '--disable-software-rasterizer',
      '--disable-remote-fonts',

      // PRIVACY & DATA PROTECTION
      '--password-store=basic',
      '--use-mock-keychain',
    ],
    defaultViewport: null,
  });
};
