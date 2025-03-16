import { executeNavigation } from './src/executeNavigation.js';
import { testDetection } from './src/testDetection.js';
import { scrapeAvitoCars } from './src/scrapeAvitoCars.js';

const main = async () => {
  console.log('🚀 Starting Puppeteer script...');

  await scrapeAvitoCars();
  //await executeNavigation();
  //await testDetection();

  console.log('✅ Script execution completed.');
};

main().catch(console.error);
