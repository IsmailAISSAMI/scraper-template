# 🚀 Puppeteer Web Scraper

A Puppeteer-based web scraper that utilizes stealth techniques to help reduce detection and enable more reliable automation.

## 🛠️ Technologies Used

- [Puppeteer-extra](https://github.com/berstend/puppeteer-extra)
- [Puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
- Node.js (ES Modules)
- Secure environment configuration (`dotenv`)

## 🚀 Quick Start

**1. Clone the Repository && Install Dependencies**

- Clone the Repository:

```sh
git clone https://github.com/IsmailAISSAMI/scraper-template.git
cd scraper-template
```

- Install Dependencies:

```bash
npm install
```

**2. Configure .env File**

Create a `.env` file in your project's root directory based on the example below:

```env
HEADLESS=false
TARGET_URL=https://www.avito.ma/fr/maroc/voitures
NAVIGATION_TIMEOUT=60000
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=800
TIMEZONE=Africa/Casablanca
```

**3. Run the Scraper**

```bash
npm run start
```

## 📂 File Structure

```
📦 scraper-template
├── 📂 data               # Stores scraped data (JSON files)
├── 📂 helpers            # Utility functions (screenshot & data handling)
├── 📂 logs               # Log files for debugging
├── 📂 screenshots        # Captured screenshots
├── 📂 src                # Core scrapers & configurations
│   ├── scrapeAvitoCars.js   # Avito.ma scraper logic
│   ├── testDetection.js     # Bot detection tests
│   ├── configurePage.js     # Puppeteer page config
│   ├── initializeBrowser.js # Puppeteer setup
├── .env                 # Environment variables
├── .gitignore           # Ignore unnecessary files
├── config.js            # Configuration file
├── index.js             # Main execution script
├── package.json         # Node dependencies
└── README.md            # Project documentation
```

## 🔐 Security Notice

- **Never** commit sensitive files (`.env`, screenshots, logs).
- Ensure scripts run securely behind VPN/proxies.
