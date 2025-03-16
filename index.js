import { executeNavigation } from './src/executeNavigation.js';
import { testDetection } from './src/testDetection.js';

const main = async () => {
  console.log('🚀 Starting Puppeteer script...');

  await testDetection();
  await executeNavigation();

  console.log('✅ Script execution completed.');
};

main().catch(console.error);
