/**
 * Get recipe image URL, using default if not provided
 * @param {string} imageUrl - Recipe image URL (optional)
 * @param {string} title - Recipe title (optional, for default image)
 * @returns {string} - Image URL or default image path
 */
export function getRecipeImage(imageUrl, title = '') {
  return imageUrl || '/images/default.jpg';
}

