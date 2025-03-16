import dotenv from 'dotenv';

dotenv.config();

export const config = {
  headless: process.env.HEADLESS !== 'false',
  targetUrl: process.env.TARGET_URL || 'https://default-url.com',
  navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT) || 60000,
};
