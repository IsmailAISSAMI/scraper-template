import randomUseragent from 'random-useragent';

/**
 * Configures a Puppeteer page with stealth settings.
 * @param {puppeteer.Browser} browser - Puppeteer browser instance.
 * @returns {Promise<puppeteer.Page>} Configured Puppeteer page.
 */
export const configurePage = async (browser) => {
  const page = await browser.newPage();
  await page.setUserAgent(randomUseragent.getRandom());
  await page.setViewport({ width: 1280, height: 800 });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: 'denied' })
        : Promise.resolve({ state: 'granted' });

    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
  });

  return page;
};
