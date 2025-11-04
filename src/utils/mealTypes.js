// Utility for managing meal types dynamically from recipes

// Bulgarian labels mapping for meal types
const MEAL_TYPE_LABELS = {
  breakfast: 'Закуска',
  lunch: 'Обяд',
  dinner: 'Вечеря',
  snack: 'Междинно хранене',
  dessert: 'Десерт',
  // Add more mappings as needed
};

/**
 * Extract unique meal types from recipes and generate MEAL_TYPES array
 * @param {Array} recipes - Array of recipe objects
 * @returns {Array} Array of meal type objects with value and label
 */
export function getMealTypesFromRecipes(recipes) {
  // Extract unique meal types from recipes
  const uniqueMealTypes = [...new Set(recipes.map(recipe => recipe.mealType).filter(Boolean))];
  
  // Sort meal types for consistent ordering
  const sortedMealTypes = uniqueMealTypes.sort();
  
  // Generate MEAL_TYPES array with labels
  return sortedMealTypes.map(mealType => ({
    value: mealType,
    label: MEAL_TYPE_LABELS[mealType] || mealType // Fallback to value if no label found
  }));
}

/**
 * Get label for a meal type value
 * @param {string} value - Meal type value
 * @returns {string} Bulgarian label for the meal type
 */
export function getMealTypeLabel(value) {
  return MEAL_TYPE_LABELS[value] || value;
}

/**
 * Get default meal types (for form dropdowns, etc.)
 * @returns {Array} Array of default meal type objects
 */
export function getDefaultMealTypes() {
  return [
    { value: 'breakfast', label: 'Закуска' },
    { value: 'lunch', label: 'Обяд' },
    { value: 'dinner', label: 'Вечеря' },
    { value: 'snack', label: 'Междинно хранене' },
    { value: 'dessert', label: 'Десерт' }
  ];
}

