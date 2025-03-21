import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const glob = require('glob');

// ---------- UTILS ----------
const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const val = item[key] || 'Unknown';
    acc[val] = acc[val] ? acc[val] + 1 : 1;
    return acc;
  }, {});

const toPercent = (num, total) =>
  total ? `${((num / total) * 100).toFixed(1)}%` : '0.0%';

const priceBuckets = (prices) => {
  const ranges = {
    '< 100,000': 0,
    '100,000 – 200,000': 0,
    '200,000 – 300,000': 0,
    '> 300,000': 0,
  };

  for (const p of prices) {
    if (p < 100000) ranges['< 100,000']++;
    else if (p <= 200000) ranges['100,000 – 200,000']++;
    else if (p <= 300000) ranges['200,000 – 300,000']++;
    else ranges['> 300,000']++;
  }

  return ranges;
};

// ---------- LOAD & SAVE ----------
const loadLatestReport = () => {
  const files = glob.sync('./data/avito_cars_*.json');
  if (!files.length) throw new Error('❌ No data files found in ./data');
  const latest = files.sort().reverse()[0];
  console.log(`📄 Using latest file: ${latest}`);

  const json = JSON.parse(fs.readFileSync(latest, 'utf-8'));
  const tsMatch = latest.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)?.[0];
  const end = tsMatch
    ? dayjs(
        tsMatch
          .replace(/-/g, ':')
          .replace('T', ' ')
          .replace(/:(\d{2})$/, (_, s) => `:${s}`)
      )
    : dayjs();
  const start = end.subtract(24, 'hour');
  return { data: json, start, end };
};

const saveMarkdownReport = (content, lang = 'EN') => {
  const filename = `Market_Report_${lang}_${dayjs().format('YYYY-MM-DD')}.md`;
  const outPath = path.join('./reports', filename);
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log(`✅ Markdown report saved: ${outPath}`);
};

// ---------- MARKDOWN GENERATOR ----------
const createMarkdown = (data, startTime, endTime, lang = 'EN') => {
  const recent = data.filter(
    (d) => d.postedAt && d.postedAt !== 'il y a 1 jour'
  );
  const priceList = recent
    .map((d) => d.price)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const priceCount = priceList.length;
  const median = priceList[Math.floor(priceCount / 2)] || 0;
  const priceRange = [priceList[0], priceList[priceList.length - 1]];
  const listingsCount = recent.length;
  const listingsPerHour = (listingsCount / 24).toFixed(1);
  const bucketed = priceBuckets(priceList);

  const brands = groupBy(
    recent.map((d) => d.title.split(' ')[0]),
    'brand'
  );
  const topBrands = Object.entries(brands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const models = groupBy(
    recent.map((d) => d.title),
    'model'
  );
  const topModels = Object.entries(models)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const years = groupBy(recent, 'year');
  const yearTop = Object.entries(years)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const trans = groupBy(recent, 'transmission');
  const fuel = groupBy(recent, 'fuel');
  const locs = groupBy(recent, 'location');
  const topLocs = Object.entries(locs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  const resellerGuess = recent.filter(
    (ad) =>
      ad.title.toLowerCase().includes('auto') ||
      ad.location.toLowerCase().includes('garage')
  );

  if (lang === 'AR') {
    return `<div dir="rtl">

# تقرير السوق - أكادير

**التاريخ:** ${endTime.format('YYYY-MM-DD')}  
**الفترة:** من ${startTime.format('YYYY-MM-DD HH:mm')} إلى ${endTime.format(
      'YYYY-MM-DD HH:mm'
    )}  
**المصدر:** Avito.ma  
**تحليل:** وحدة استخبارات AutoVision

---

## 1. ملخص الإعلانات

- **عدد الإعلانات الحديثة:** ${listingsCount}
- **متوسط عدد الإعلانات بالساعة:** ~${listingsPerHour}

---

## 2. تحليل الأسعار

- **إعلانات مع السعر:** ${priceCount} من ${listingsCount} (${toPercent(
      priceCount,
      listingsCount
    )})
- **نطاق السعر:** ${priceRange[0] ?? 'N/A'} – ${priceRange[1] ?? 'N/A'} درهم
- **السعر الوسيط:** ~${median} درهم

| الفئة السعرية      | العدد | النسبة |
|--------------------|--------|--------|
${Object.entries(bucketed)
  .map(
    ([label, count]) =>
      `| ${label.padEnd(20)} | ${count} | ${toPercent(count, listingsCount)} |`
  )
  .join('\n')}
| غير محدد           | ${listingsCount - priceCount} | ${toPercent(
      listingsCount - priceCount,
      listingsCount
    )} |

---

## 3. العلامات التجارية الأكثر تكراراً

| العلامة | العدد |
|--------|-------|
${topBrands.map(([b, n]) => `| ${b} | ${n} |`).join('\n')}

---

## 4. أكثر الموديلات تكراراً

| الموديل | العدد |
|--------|--------|
${topModels.map(([m, c]) => `| ${m.slice(0, 22)} | ${c} |`).join('\n')}

---

## 5. سنة الصنع

| السنة | العدد |
|------|-------|
${yearTop.map(([y, c]) => `| ${y} | ${c} |`).join('\n')}

---

## 6. ناقل الحركة والوقود

**ناقل الحركة**

| النوع | النسبة |
|------|--------|
${Object.entries(trans)
  .map(([t, c]) => `| ${t} | ${toPercent(c, listingsCount)} |`)
  .join('\n')}

**نوع الوقود**

| الوقود | النسبة |
|--------|--------|
${Object.entries(fuel)
  .map(([f, c]) => `| ${f} | ${toPercent(c, listingsCount)} |`)
  .join('\n')}

---

## 7. توزيع جغرافي – الأحياء

| الحي | العدد |
|------|-------|
${topLocs.map(([l, c]) => `| ${l} | ${c} |`).join('\n')}

---

## 8. مؤشرات البائعين

- **عدد الإعلانات بدون سعر:** ${listingsCount - priceCount}
- **بائعون محترفون (garage/auto):** ${resellerGuess.length}
- **بائعون أفراد (تقديري):** ${
      listingsCount - resellerGuess.length
    } (${toPercent(listingsCount - resellerGuess.length, listingsCount)})
</div>`;
  }

  // ENGLISH VERSION
  return `# AutoVision Market Intelligence Report – Agadir

**Date:** ${endTime.format('YYYY-MM-DD')}  
**Source:** Avito.ma  
**Region:** Agadir  
**Reporting Window:** ${startTime.format(
    'YYYY-MM-DD HH:mm'
  )} → ${endTime.format('YYYY-MM-DD HH:mm')}

---

## 1. Listings Summary

- **Total recent listings:** ${listingsCount}
- **Average listing frequency:** ~${listingsPerHour} listings/hour

---

## 2. Pricing Intelligence

- **Listings with price:** ${priceCount} / ${listingsCount} (${toPercent(
    priceCount,
    listingsCount
  )})
- **Price range:** ${priceRange[0] ?? 'N/A'} – ${priceRange[1] ?? 'N/A'} MAD
- **Median price:** ~${median} MAD

| Price Range (MAD) | Listings | % |
|-------------------|----------|---|
${Object.entries(bucketed)
  .map(
    ([label, count]) =>
      `| ${label.padEnd(18)} | ${count} | ${toPercent(count, listingsCount)} |`
  )
  .join('\n')}
| Not Specified      | ${listingsCount - priceCount} | ${toPercent(
    listingsCount - priceCount,
    listingsCount
  )} |

---

## 3. Top Brands

| Brand | Listings |
|-------|----------|
${topBrands.map(([b, n]) => `| ${b} | ${n} |`).join('\n')}

---

## 4. Most Listed Models

| Model | Count |
|-------|-------|
${topModels.map(([m, c]) => `| ${m.slice(0, 20)} | ${c} |`).join('\n')}

---

## 5. Year of Manufacture

| Year | Listings |
|------|----------|
${yearTop.map(([y, c]) => `| ${y} | ${c} |`).join('\n')}

---

## 6. Transmission & Fuel

**Transmission**

| Type | % |
|------|---|
${Object.entries(trans)
  .map(([t, c]) => `| ${t} | ${toPercent(c, listingsCount)} |`)
  .join('\n')}

**Fuel**

| Type | % |
|------|---|
${Object.entries(fuel)
  .map(([f, c]) => `| ${f} | ${toPercent(c, listingsCount)} |`)
  .join('\n')}

---

## 7. Geographic Breakdown

| Neighborhood | Listings |
|--------------|----------|
${topLocs.map(([l, c]) => `| ${l} | ${c} |`).join('\n')}

---

## 8. Reseller Indicators

- **Listings without price:** ${listingsCount - priceCount}
- **Detected resellers (garage/auto):** ${resellerGuess.length}
- **Estimated private owners:** ${
    listingsCount - resellerGuess.length
  } (${toPercent(listingsCount - resellerGuess.length, listingsCount)})
`;
};

// -------- ENTRY POINT --------
try {
  const { data, start, end } = loadLatestReport();
  const mdEN = createMarkdown(data, start, end, 'EN');
  const mdAR = createMarkdown(data, start, end, 'AR');

  if (!fs.existsSync('./reports')) fs.mkdirSync('./reports');
  saveMarkdownReport(mdEN, 'EN');
  saveMarkdownReport(mdAR, 'AR');
} catch (err) {
  console.error(`❌ Markdown generation failed: ${err.message}`);
}
