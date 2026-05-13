import fs from 'node:fs';
import path from 'node:path';
import { parseRecipeMarkdown } from '../src/utils/recipeParser.js';
import { getMealTypesFromRecipes, getDefaultMealTypes } from '../src/utils/mealTypes.js';

/** Injected by scripts/generate-book-pdf.cjs via esbuild `define` */
const REPO_ROOT = __REPO_ROOT__;

export function loadAllRecipesForBook() {
  const recipesDir = path.join(REPO_ROOT, 'public', 'recipes');
  const files = fs
    .readdirSync(recipesDir)
    .filter(
      (file) =>
        file.endsWith('.md') &&
        file !== 'README.md' &&
        !file.startsWith('.')
    );

  const recipes = files.map((filename) => {
    const markdown = fs.readFileSync(path.join(recipesDir, filename), 'utf8');
    const recipe = parseRecipeMarkdown(markdown);
    return { id: filename, filename, ...recipe };
  });

  const dynamicMealTypes = getMealTypesFromRecipes(recipes);
  const mealTypes = dynamicMealTypes.length > 0 ? dynamicMealTypes : getDefaultMealTypes();

  return { recipes, mealTypes };
}
