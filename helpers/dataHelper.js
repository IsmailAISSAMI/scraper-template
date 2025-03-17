import fs from 'fs/promises';
import path from 'path';

/**
 * Asynchronously saves JSON data to a timestamped file in the /data directory.
 * @param {string} filenamePrefix - Prefix for the filename (e.g., "avito_cars").
 * @param {Object} data - The JSON data to save.
 * @returns {Promise<string>} The full file path of the saved data.
 */
export const saveData = async (filenamePrefix, data) => {
  const dataDir = './data';

  try {
    await fs.mkdir(dataDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(dataDir, `${filenamePrefix}_${timestamp}.json`);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`📁 Data saved: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`❌ Error saving data: ${error.message}`);
    throw error;
  }
};

/**
 * Removes duplicate car listings based on unique links
 * @param {Array} cars - Car data array
 * @returns {Array} - Deduplicated car data
 */
export const removeDuplicates = (cars) => {
  return Array.from(new Map(cars.map((car) => [car.link, car])).values());
};
