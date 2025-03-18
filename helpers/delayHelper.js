/**
 * Generates a random delay between min and max milliseconds.
 * @param {number} min - Minimum delay time in milliseconds.
 * @param {number} max - Maximum delay time in milliseconds.
 * @returns {Promise<void>} - Resolves after the random delay.
 */
export const randomDelay = async (min, max) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`⏳ Waiting for ${delay}ms to avoid detection...`);
  return new Promise((resolve) => setTimeout(resolve, delay));
};
