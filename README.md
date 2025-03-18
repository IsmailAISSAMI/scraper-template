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

## TO DO

1. Data Validation and Cleaning
   • Implement Data Validation Rules: Before storing the scraped data, apply validation rules to ensure that fields like year, price, and transmission adhere to expected formats. For example, the year should be a four-digit number within a plausible range (e.g., 1900 to the current year).
   • Normalize Data Formats: Standardize formats for fields such as price by removing currency symbols and converting the values to numerical types. This will facilitate easier analysis and comparison.

2. Handling Missing or Incorrect Data
   • Imputation Techniques: For missing values, consider using imputation methods. For instance, if the fuel type is missing but the title contains the word “Diesel,” you can infer the fuel type as Diesel. However, exercise caution with imputation to avoid introducing biases.
   • Flag Incomplete Entries: Assign a quality score to each listing based on the completeness of its data. This allows you to filter out or give less weight to listings with missing or inconsistent information during analysis.

3. Enhancing Data Collection Methods
   • Use Advanced Scraping Tools: Employ scraping tools that can handle dynamic content and are capable of extracting structured data more accurately. Tools like Apify’s Avito Offers Scraper allow for customizable search parameters and can extract comprehensive offer information, including titles, descriptions, prices, seller info, locations, and images. ￼
   • Regular Expression (Regex) Patterns: Utilize regex patterns to extract structured information from unstructured fields. For example, if the year is sometimes included in the title, a regex can help extract this information.

4. Automated Data Quality Monitoring
   • Set Up Alerts for Anomalies: Implement monitoring systems that alert you to anomalies, such as a sudden increase in missing price fields, which could indicate changes in the website’s structure or data entry patterns.
   • Wrapper Maintenance: Develop self-repairing web wrappers that can adapt to changes in the website’s structure, reducing the need for manual intervention. Research in this area suggests that machine learning approaches can be effective for wrapper maintenance. ￼

5. Collaborate with Data Entry Platforms
   • Engage with Avito.ma: If possible, collaborate with Avito.ma to understand their data entry processes and provide feedback on common data quality issues. This collaboration could lead to improved data entry guidelines for sellers, resulting in higher quality data.
   • User Education: Encourage the platform to educate sellers on the importance of providing complete and accurate information, perhaps through prompts or mandatory fields during the listing process.

6. Leverage External Data Sources
   • Cross-Reference with Other Platforms: To fill in missing information, cross-reference listings with other automotive platforms or databases. This can help enrich your dataset and improve accuracy.
   • Use of APIs: Where available, utilize APIs from automotive databases to validate and supplement the scraped data.

By implementing these strategies, you can enhance the quality of your dataset despite the limitations posed by user-generated content on platforms like Avito.ma. Remember, while you cannot control the data entry behavior of individual sellers, robust data processing and validation techniques can significantly mitigate the impact of incomplete or inconsistent data.
