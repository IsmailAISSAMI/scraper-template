import randomUseragent from 'random-useragent';
import { config } from '../config.js';

/**
 * Configures a Puppeteer page with enhanced stealth settings.
 * @param {puppeteer.Browser} browser - Puppeteer browser instance.
 * @returns {Promise<puppeteer.Page>} Securely configured Puppeteer page instance.
 */
export const configurePage = async (browser) => {
  const page = await browser.newPage();

  try {
    const userAgent = randomUseragent.getRandom(
      (ua) => ua.osName === 'Windows'
    );
    await page.setUserAgent(userAgent);

    // Consistent viewport
    await page.setViewport({
      width: config.viewportWidth || 1280,
      height: config.viewportHeight || 800,
    });

    // Timezone spoofing (improves stealth)
    await page.emulateTimezone(config.timezone || 'America/New_York');

    // Stealth measures executed on every new document/page load
    await page.evaluateOnNewDocument(() => {
      // Anti-detection via WebDriver
      Object.defineProperty(navigator, 'webdriver', { get: () => false });

      // Permissions spoofing
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' })
          : Promise.resolve({ state: 'granted' });

      // Language spoofing
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Platform spoofing
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });

      // WebGL Vendor spoofing
      const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) return 'NVIDIA Corporation'; // Fake Vendor
        if (parameter === 37446) return 'NVIDIA GeForce GTX 1080'; // Fake Renderer
        return originalGetParameter.call(this, parameter);
      };

      // Disable WebRTC to prevent IP leaks
      [
        'RTCPeerConnection',
        'RTCDataChannel',
        'webkitRTCPeerConnection',
      ].forEach((prop) => {
        Object.defineProperty(window, prop, { get: () => undefined });
      });

      // Plugins spoofing
      Object.defineProperty(navigator, 'plugins', {
        get: () => new Array(5).fill(null),
      });

      // MimeTypes spoofing
      Object.defineProperty(navigator, 'mimeTypes', {
        get: () => new Array(5).fill(null),
      });

      // Web Worker spoofing to prevent "hasInconsistentWorkerValues"
      const originalWorker = window.Worker;
      class FakeWorker extends originalWorker {
        constructor(stringUrl) {
          if (stringUrl.startsWith('data:')) {
            super(stringUrl);
          } else {
            throw new Error('Not allowed');
          }
        }
      }
      Object.defineProperty(window, 'Worker', { value: FakeWorker });

      // Shared Worker spoofing
      const originalSharedWorker = window.SharedWorker;
      class FakeSharedWorker extends originalSharedWorker {
        constructor(stringUrl) {
          if (stringUrl.startsWith('data:')) {
            super(stringUrl);
          } else {
            throw new Error('Not allowed');
          }
        }
      }
      Object.defineProperty(window, 'SharedWorker', {
        value: FakeSharedWorker,
      });

      // Fix Inconsistent Worker Values
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 }); // Spoof device RAM
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 }); // Fake CPU cores
    });

    console.log(
      `✅ [configurePage.js] Puppeteer page configured securely with User-Agent: ${userAgent}`
    );
  } catch (error) {
    console.error(
      `❌ [configurePage.js] Failed to configure page: ${error.message}`,
      error
    );

    throw error;
  }

  return page;
};
