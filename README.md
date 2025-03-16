# 🚀 Puppeteer Web Scraper

A Puppeteer-based web scraper that utilizes stealth techniques to help reduce detection and enable more reliable automation.

## 🛠️ Technologies Used

- [Puppeteer-extra](https://github.com/berstend/puppeteer-extra)
- [Puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
- Node.js (ES Modules)
- Secure environment configuration (`dotenv`)

## 🚀 Quick Start

**1. Install Dependencies**

```bash
npm install
```

**2. Configure .env File**

Create a `.env` file in your project's root directory based on the example below:

```env
HEADLESS=true
TARGET_URL=https://target-website.com
NAVIGATION_TIMEOUT=60000
```

**3. Run the Scraper**

```bash
npm run start
```

## 🔐 Security Notice

- **Never** commit sensitive files (`.env`, screenshots, logs).
- Ensure scripts run securely behind VPN/proxies.
