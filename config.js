import dotenv from 'dotenv';

dotenv.config();

export const config = {
  headless: process.env.HEADLESS !== 'false',
  targetUrl: process.env.TARGET_URL || 'https://google.com',
  navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT) || 60000,
  viewportWidth: Number(process.env.VIEWPORT_WIDTH) || 1280,
  viewportHeight: Number(process.env.VIEWPORT_HEIGHT) || 800,
  timezone: process.env.TIMEZONE || 'America/New_York',

  minCarYear: Number(process.env.MIN_CAR_YEAR) || 1980,

  cookiePopupTimeout: 2000,
  cookiePostClickDelay: 500,
  paginationLimit: 5,
};
