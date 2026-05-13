import { generateAllRecipesPDF } from '../src/utils/pdfGenerator.js';

globalThis.__runBookPdf = async (recipes, mealTypes) => {
  const ab = await generateAllRecipesPDF(recipes, mealTypes, {
    returnAs: 'arraybuffer',
  });
  return Array.from(new Uint8Array(ab));
};
