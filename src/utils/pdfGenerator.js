import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getRecipeImage } from './recipeImage';
import { MEAL_TYPE_LABELS } from './mealTypes';

/**
 * Create HTML content for a recipe
 */
function createRecipeHTML(recipe, mealTypeLabel) {
  const lines = recipe.content.split('\n');
  let htmlContent = '';
  
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      htmlContent += '<br/>';
      return;
    }

    // Handle headings
    if (trimmedLine.startsWith('## ')) {
      htmlContent += `<h3 style="font-size: 13px; font-weight: bold; margin: 12px 0 8px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(3)}</h3>`;
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      htmlContent += `<h4 style="font-size: 12px; font-weight: bold; margin: 10px 0 6px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(4)}</h4>`;
      return;
    }

    if (trimmedLine.startsWith('#### ')) {
      htmlContent += `<h5 style="font-size: 12px; font-weight: bold; margin: 10px 0 6px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(4)}</h5>`;
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      htmlContent += `<h2 style="font-size: 15px; font-weight: bold; margin: 14px 0 10px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(2)}</h2>`;
      return;
    }

    // Handle lists
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="font-size: 12px; margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">• ${text}</p>`;
      return;
    }

    // Handle numbered lists
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      const text = numberedMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="font-size: 12px; margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">${text}</p>`;
      return;
    }

    // Handle bold text
    let processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Regular paragraph - add page-break-before if needed
    htmlContent += `<p style="font-size: 12px; margin: 6px 0; line-height: 1.6; page-break-inside: avoid; orphans: 2; widows: 2; page-break-before: auto;">${processedLine}</p>`;
  });

  const hasImage = recipe.photo && recipe.photo.trim() !== '';
  const recipeImage = getRecipeImage(recipe.photo, recipe.title);  
  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #333; background: white; width: 450px; box-sizing: border-box;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 16px; gap: 20px;">
        <div style="flex: 1; min-width: 0;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #2c3e50; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;">${recipe.title}</h1>
        </div>
      </div>
      <div style="margin-bottom: 20px; color: #666; font-size: 9px;">
        <p style="margin: 4px 0;">Тип: ${mealTypeLabel}</p>
        <p style="margin: 4px 0;">Автор: ${recipe.author}</p>
      </div>
      <div style="margin-bottom: 20px;">
        ${hasImage ? 
          `<div style="float: right; margin-left: 20px; margin-bottom: 10px; width: 180px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="${recipeImage}" alt="${recipe.title}" style="width: 100%; height: auto; display: block;" />
          </div>`
        : ''}
        <div style="margin-top: 0;">
          ${htmlContent}
        </div>
        <div style="clear: both;"></div>
      </div>
    </div>
  `;
  
}

/**
 * Create HTML content for a single recipe (for all recipes PDF)
 */
function createSingleRecipeHTML(recipe, mealTypeLabel) {
  const lines = recipe.content.split('\n');
  let htmlContent = '';
  
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      htmlContent += '<br/>';
      return;
    }

    if (trimmedLine.startsWith('## ')) {
      htmlContent += `<h3 style="font-size: 12px; font-weight: bold; margin: 12px 0 8px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(3)}</h3>`;
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      htmlContent += `<h4 style="font-size: 11px; font-weight: bold; margin: 10px 0 6px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(4)}</h4>`;
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      htmlContent += `<h2 style="font-size: 14px; font-weight: bold; margin: 14px 0 10px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(2)}</h2>`;
      return;
    }

    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="font-size: 11px; margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">• ${text}</p>`;
      return;
    }

    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      const text = numberedMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="font-size: 11px; margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">${text}</p>`;
      return;
    }

    let processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    htmlContent += `<p style="font-size: 11px; margin: 6px 0; line-height: 1.6; page-break-inside: avoid; orphans: 2; widows: 2;">${processedLine}</p>`;
  });

  const hasImage = recipe.photo && recipe.photo.trim() !== '';
  const recipeImage = getRecipeImage(recipe.photo, recipe.title);
  return `
    <div style="color: #333; font-family: 'Times New Roman', Times, serif; background: white; width: 450px; box-sizing: border-box;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 16px; gap: 20px;">
        <div style="flex: 1; min-width: 0;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #2c3e50; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;">${recipe.title}</h1>
        </div>
      </div>
      <div style="margin-bottom: 20px; color: #666; font-size: 9px;">
        <p style="margin: 4px 0;">Тип: ${mealTypeLabel}</p>
        <p style="margin: 4px 0;">Автор: ${recipe.author}</p>
      </div>
      <div style="margin-bottom: 20px;">
        ${hasImage ? 
        `<div style="float: right; margin-left: 20px; margin-bottom: 10px; width: 180px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <img src="${recipeImage}" alt="${recipe.title}" style="width: 100%; height: auto; display: block;" />
        </div>`
        : ''}
        <div style="margin-top: 0;">
          ${htmlContent}
        </div>
        <div style="clear: both;"></div>
      </div>
    </div>
  `;
}

/**
 * Create HTML content for chapter header (mealType)
 */
function createChapterHTML(mealTypeLabel) {
  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #333; background: white; width: 450px; box-sizing: border-box; height: 620px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
      <h1 style="font-size: 26px; font-weight: bold; margin: 0; color: #2c3e50; text-align: center; border-bottom: 3px solid #3498db; word-wrap: break-word; white-space: normal; max-width: 100%;">${mealTypeLabel}</h1>
    </div>
  `;
}

/**
 * Create HTML content for title page
 */
function createTitlePageHTML() {
  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #333; background: white; width: 450px; box-sizing: border-box; min-height: 714px; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <h1 style="font-size: 30px; font-weight: bold; margin: 0; color: #2c3e50;">Книга със здравословни рецепти</h1>
        <h2 style="font-size: 15px; font-weight: normal; margin: 16px 0 0 0; color: #888;">на група "Звездичка" към ДГ "Слънчев дом"</h2>
      </div>
    </div>
  `;
}

/**
 * Create HTML content for table of contents with page numbers
 */
function createTOCHTML(recipePageMap, mealTypes) {
  let tocHTML = '';
  let currentMealType = null;
  
  // Group by mealType in TOC
  recipePageMap.forEach(({ recipe, pageNumber }) => {
    const mealTypeLabel = mealTypes.find(mt => mt.value === recipe.mealType)?.label || recipe.mealType;
    
    // Add mealType header if it's a new mealType
    if (currentMealType !== recipe.mealType) {
      if (currentMealType !== null) {
        tocHTML += '<div style="margin: 15px 0;"></div>'; // Spacing between mealType groups
      }
      tocHTML += `<h3 style="font-size: 13px; font-weight: bold; margin: 20px 0 8px 0; color: #3498db; border-top: 1px solid #e0e0e0;">${mealTypeLabel}</h3>`;
      currentMealType = recipe.mealType;
    }
    
    tocHTML += `<p style="margin: 4px 0; padding-left: 20px; font-size: 10px; display: flex; align-items: flex-end; gap: 2px;">
      <span style="flex-shrink: 0;">${recipe.title}</span>
      <span style="flex: 1; border-bottom: 1px dotted #999; height: 1px;"></span>
      <span style="color: #666; font-weight: normal; flex-shrink: 0; width: 10px; text-align: right;">${pageNumber}</span>
    </p>`;
  });

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #333; background: white; width: 450px; box-sizing: border-box;">
      <h2 style="font-size: 15px; font-weight: bold; margin: 20px 0 10px 0;">Съдържание</h2>
      ${tocHTML}
    </div>
  `;
}

/**
 * Split content into pages with smart page breaks
 */
function splitContentIntoPages(div, pageHeightPx) {
  const pages = [];
  const contentHeight = div.scrollHeight;
  const minParagraphHeight = 30; // Minimum height for a paragraph (px)
  const pageBreakThreshold = pageHeightPx * 0.15; // 15% from bottom - threshold for page break
  
  // Create a clone to measure content
  const clone = div.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.height = 'auto';
  document.body.appendChild(clone);
  
  // Get all paragraphs and headings
  const allElements = Array.from(clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));
  
  let currentPage = document.createElement('div');
  currentPage.style.width = '450px';
  currentPage.style.background = 'white';
  currentPage.style.padding = '40px';
  currentPage.style.boxSizing = 'border-box';
  currentPage.style.fontFamily = "'Times New Roman', Times, serif";
  let currentHeight = 40; // Start with padding
  
  // Find title/image header, metadata divs, content div, and image container
  const titleHeaderDiv = clone.querySelector('div[style*="display: flex"]');
  const title = clone.querySelector('h1');
  const metadataDiv = clone.querySelector('div:not([style*="display: flex"])');
  const contentDiv = clone.querySelector('div:last-of-type');
  const imageContainer = clone.querySelector('div[style*="float: right"]');
  const imageParentContainer = imageContainer ? imageContainer.parentElement : null;
  
  // Add title/image header to first page
  if (titleHeaderDiv) {
    currentPage.appendChild(titleHeaderDiv.cloneNode(true));
    currentHeight += titleHeaderDiv.offsetHeight + 16;
  } else if (title) {
    // Fallback if no flex container
    currentPage.appendChild(title.cloneNode(true));
    currentHeight += title.offsetHeight + 20;
  }
  
  if (metadataDiv && metadataDiv !== contentDiv && !metadataDiv.contains(titleHeaderDiv)) {
    // Add metadata paragraphs
    const metadataParagraphs = Array.from(metadataDiv.querySelectorAll('p'));
    metadataParagraphs.forEach(p => {
      currentPage.appendChild(p.cloneNode(true));
      currentHeight += p.offsetHeight + 10;
    });
  }
  
  // Add image container structure to first page if it exists
  // We need to preserve the parent container that holds both image and content for float to work
  if (imageContainer && imageParentContainer) {
    // Clone the entire parent container that holds the image and content
    const imageParentClone = imageParentContainer.cloneNode(true);
    // Remove all text content elements from the clone (we'll add them back separately as we process)
    const textContentDiv = imageParentClone.querySelector('div[style*="margin-top: 0"]');
    if (textContentDiv) {
      textContentDiv.innerHTML = ''; // Clear content, we'll add it back element by element
    }
    // Add the image parent container to the first page
    currentPage.appendChild(imageParentClone);
    // Calculate height - use the image container height plus some margin
    const imgHeight = imageContainer.offsetHeight || 200;
    currentHeight += imgHeight + 20;
  }
  
  // Filter out title and metadata elements from content processing
  const elements = allElements.filter(element => {
    // Skip if it's the title
    if (element === title) {
      return false;
    }
    // Skip if it's in the title/image header
    if (titleHeaderDiv && titleHeaderDiv.contains(element)) {
      return false;
    }
    // Skip if it's in the metadata div
    if (metadataDiv && metadataDiv !== contentDiv && metadataDiv.contains(element)) {
      return false;
    }
    // Only include elements in the content area
    return contentDiv && contentDiv.contains(element);
  });
  
  elements.forEach((element, index) => {
    
    const elementHeight = element.offsetHeight || 30;
    const remainingSpace = pageHeightPx - currentHeight;
    
    // Check if we need a page break
    if (remainingSpace < pageBreakThreshold && elementHeight > remainingSpace) {
      // Save current page
      pages.push(currentPage);
      
      // Start new page
      currentPage = document.createElement('div');
      currentPage.style.width = '450px';
      currentPage.style.background = 'white';
      currentPage.style.padding = '40px';
      currentPage.style.boxSizing = 'border-box';
      currentPage.style.fontFamily = "'Times New Roman', Times, serif";
      currentHeight = 40; // Reset with padding
    }
    
    // Find where to add the element - if there's an image container, add to its text content div
    let targetContainer = currentPage;
    const textContentDiv = currentPage.querySelector('div[style*="margin-top: 0"]');
    if (textContentDiv) {
      targetContainer = textContentDiv;
    }
    
    // Add element to current page
    targetContainer.appendChild(element.cloneNode(true));
    currentHeight += elementHeight + 10; // Add element height plus margin
  });
  
  // Add last page
  if (currentPage.children.length > 0) {
    pages.push(currentPage);
  }
  
  document.body.removeChild(clone);
  return pages;
}

/**
 * Wait for fonts to load
 */
function waitForFonts() {
  return document.fonts.ready;
}

/**
 * Calculate proper image height for PDF accounting for canvas scale
 * @param {number} canvasWidth - Canvas width in pixels (scaled)
 * @param {number} canvasHeight - Canvas height in pixels (scaled)
 * @param {number} contentWidthMm - Content width in mm for PDF
 * @param {number} scale - Scale factor used in html2canvas (default: 3)
 * @returns {number} - Image height in mm for PDF
 */
function calculateImageHeightForPDF(canvasWidth, canvasHeight, contentWidthMm, scale = 3) {
  // Canvas is generated at scale, so canvas.width = actualWidth * scale
  // But the actual content width is canvas.width / scale
  const actualContentWidthPx = canvasWidth / scale;
  const actualContentHeightPx = canvasHeight / scale;
  
  // Convert pixels to mm for PDF
  // contentWidthMm should map to actualContentWidthPx
  const pxToMm = contentWidthMm / actualContentWidthPx;
  const imgHeightMm = actualContentHeightPx * pxToMm;
  
  return imgHeightMm;
}

/**
 * Wait for images to load in an element
 */
function waitForImages(element) {
  const images = element.querySelectorAll('img');
  const imagePromises = Array.from(images).map(img => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = resolve; // Resolve even on error to not block
      // Timeout after 5 seconds
      setTimeout(resolve, 5000);
    });
  });
  return Promise.all(imagePromises);
}

/**
 * Generate PDF from recipe data using html2canvas with smart page breaks
 */
export async function generateRecipePDF(recipe, mealTypeLabel) {
  await waitForFonts();
  
  const htmlContent = createRecipeHTML(recipe, mealTypeLabel);
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '0';
  tempDiv.style.left = '0';
  tempDiv.style.width = '450px';
  tempDiv.style.maxWidth = '450px';
  tempDiv.style.background = 'white';
  tempDiv.style.zIndex = '-1';
  document.body.appendChild(tempDiv);

  try {
    // Wait for images to load
    await waitForImages(tempDiv);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Calculate page height in pixels (A5 at 96 DPI)
    const pageHeightPx = 794; // 210mm at 96 DPI
    
    // Split content into pages with smart breaks
    const pages = splitContentIntoPages(tempDiv, pageHeightPx);
    
  const doc = new jsPDF('p', 'mm', 'a5');
  const margin = 15; // 15mm margin on all sides
  const contentWidth = 148 - (margin * 2); // A5 width minus margins (148mm)
  const pageHeight = 210; // A5 height in mm
    
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        doc.addPage();
      }
      
      const pageDiv = pages[i];
      pageDiv.style.position = 'fixed';
      pageDiv.style.top = '0';
      pageDiv.style.left = '0';
      pageDiv.style.zIndex = '-1';
      document.body.appendChild(pageDiv);
      
      try {
        // Wait for images to load on this page
        await waitForImages(pageDiv);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(pageDiv, {
          scale: 3, // Increased from 2 to 3 for better resolution (Print as PDF quality)
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 450,
          height: pageDiv.scrollHeight,
          windowWidth: 450,
          windowHeight: pageDiv.scrollHeight,
          letterRendering: true,
          allowTaint: false,
          removeContainer: false,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            // Ensure all text is rendered with high quality
            const clonedBody = clonedDoc.body;
            clonedBody.style.webkitFontSmoothing = 'antialiased';
            clonedBody.style.mozOsxFontSmoothing = 'grayscale';
            clonedBody.style.textRendering = 'optimizeLegibility';
          }
        });
        
        // Use PNG for best text quality (lossless, better for text rendering)
        const imgData = canvas.toDataURL('image/png');
        const imgHeightMm = calculateImageHeightForPDF(canvas.width, canvas.height, contentWidth, 3);
        doc.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeightMm, undefined, 'FAST');
      } finally {
        document.body.removeChild(pageDiv);
      }
    }
    
    const safeTitle = recipe.title
      .toLowerCase()
      .replace(/[^a-z0-9а-я\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    doc.save(`Успяваме-заедно-рецепта-${safeTitle}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    document.body.removeChild(tempDiv);
  }
}

/**
 * Helper function to add a page to PDF and return current page number
 */
function addPageToPDF(doc, pageDiv, imgWidth, pageHeightPx) {
  return new Promise(async (resolve) => {
    try {
      await waitForImages(pageDiv);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(pageDiv, {
        scale: 3, // Increased from 2 to 3 for better resolution (Print as PDF quality)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 450,
        height: pageDiv.scrollHeight,
        windowWidth: 450,
        windowHeight: pageDiv.scrollHeight,
        letterRendering: true,
        allowTaint: false,
        removeContainer: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure all text is rendered with high quality
          const clonedBody = clonedDoc.body;
          clonedBody.style.webkitFontSmoothing = 'antialiased';
          clonedBody.style.mozOsxFontSmoothing = 'grayscale';
          clonedBody.style.textRendering = 'optimizeLegibility';
        }
      });
      
      // Use PNG for best text quality (lossless, better for text rendering)
      const imgData = canvas.toDataURL('image/png');
      const margin = 15; // 15mm margin on all sides
      const contentWidth = 148 - (margin * 2); // A5 width minus margins (148mm)
      const imgHeightMm = calculateImageHeightForPDF(canvas.width, canvas.height, contentWidth, 3);
      doc.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeightMm, undefined, 'FAST');
      
      resolve(doc.internal.getCurrentPageInfo().pageNumber);
    } catch (error) {
      console.error('Error adding page to PDF:', error);
      resolve(doc.internal.getCurrentPageInfo().pageNumber);
    }
  });
}

/**
 * Generate PDF with all recipes - grouped by mealType with chapters and TOC with page numbers
 */
export async function generateAllRecipesPDF(recipes, mealTypes) {
  await waitForFonts();
  
  const margin = 15; // 15mm margin on all sides
  const contentWidth = 148 - (margin * 2); // A5 width minus margins (148mm)
  const pageHeightPx = 794; // 210mm at 96 DPI

  // Group recipes by mealType
  const recipesByMealType = {};
  recipes.forEach(recipe => {
    const mealType = recipe.mealType || 'other';
    if (!recipesByMealType[mealType]) {
      recipesByMealType[mealType] = [];
    }
    recipesByMealType[mealType].push(recipe);
  });

  // Sort recipes within each mealType by title (ascending)
  Object.keys(recipesByMealType).forEach(mealType => {
    recipesByMealType[mealType].sort((a, b) => {
      const titleA = (a.title || '').toLowerCase();
      const titleB = (b.title || '').toLowerCase();
      return titleA.localeCompare(titleB);
    });
  });

  // Sort mealTypes by MEAL_TYPE_LABELS order, then alphabetically for any not in labels
  const mealTypeOrder = Object.keys(MEAL_TYPE_LABELS);
  const sortedMealTypes = Object.keys(recipesByMealType).sort((a, b) => {
    const indexA = mealTypeOrder.indexOf(a);
    const indexB = mealTypeOrder.indexOf(b);
    
    // If both are in MEAL_TYPE_LABELS, sort by index
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in MEAL_TYPE_LABELS, it comes first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // If neither is in MEAL_TYPE_LABELS, sort alphabetically
    return a.localeCompare(b);
  });

  // First pass: Generate content to determine page numbers
  const contentPages = []; // Store page data
  const recipePageMap = [];
  let currentPage = 1;

  // Generate all content and track page numbers
  for (const mealType of sortedMealTypes) {
    const mealTypeLabel = mealTypes.find(mt => mt.value === mealType)?.label || mealType;
    const mealTypeRecipes = recipesByMealType[mealType];

    // Add chapter header
    const chapterHTML = createChapterHTML(mealTypeLabel);
    const chapterDiv = document.createElement('div');
    chapterDiv.innerHTML = chapterHTML;
    chapterDiv.style.position = 'fixed';
    chapterDiv.style.top = '0';
    chapterDiv.style.left = '0';
    chapterDiv.style.width = '450px';
    chapterDiv.style.maxWidth = '450px';
    chapterDiv.style.background = 'white';
    chapterDiv.style.zIndex = '-1';
    document.body.appendChild(chapterDiv);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // For chapter pages, use the div directly without splitting (it's already centered and sized)
      // Create a page div that preserves the chapter structure
      const chapterPageDiv = document.createElement('div');
      chapterPageDiv.innerHTML = chapterHTML;
      const chapterInnerDiv = chapterPageDiv.querySelector('div');
      if (chapterInnerDiv) {
        // Preserve the original styling without adding padding
        chapterPageDiv.style.width = '450px';
        chapterPageDiv.style.background = 'white';
        chapterPageDiv.style.boxSizing = 'border-box';
        chapterPageDiv.style.padding = '0';
        chapterPageDiv.style.margin = '0';
      }
      
      const chapterPages = [chapterPageDiv];
      
      for (let i = 0; i < chapterPages.length; i++) {
        const pageDiv = chapterPages[i];
        pageDiv.style.position = 'fixed';
        pageDiv.style.top = '0';
        pageDiv.style.left = '0';
        pageDiv.style.zIndex = '-1';
        document.body.appendChild(pageDiv);
        
        try {
          await waitForImages(pageDiv);
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Constrain height to page height to prevent overflow
          const maxHeight = Math.min(pageDiv.scrollHeight, pageHeightPx);
          
          const canvas = await html2canvas(pageDiv, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 450,
            height: maxHeight,
            windowWidth: 450,
            windowHeight: maxHeight,
            letterRendering: true,
            allowTaint: false,
            removeContainer: false,
            imageTimeout: 15000,
            onclone: (clonedDoc) => {
              const clonedBody = clonedDoc.body;
              clonedBody.style.webkitFontSmoothing = 'antialiased';
              clonedBody.style.mozOsxFontSmoothing = 'grayscale';
              clonedBody.style.textRendering = 'optimizeLegibility';
            }
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgHeightMm = calculateImageHeightForPDF(canvas.width, canvas.height, contentWidth, 3);
          contentPages.push({ imgData, imgHeight: imgHeightMm, pageNumber: currentPage });
          currentPage++;
        } finally {
          document.body.removeChild(pageDiv);
        }
      }
    } finally {
      document.body.removeChild(chapterDiv);
    }

    // Add recipes for this mealType
    for (let i = 0; i < mealTypeRecipes.length; i++) {
      const recipe = mealTypeRecipes[i];
      const recipeMealTypeLabel = mealTypes.find(mt => mt.value === recipe.mealType)?.label || recipe.mealType;
      const recipeHTML = createSingleRecipeHTML(recipe, recipeMealTypeLabel);
      
      const recipeDiv = document.createElement('div');
      recipeDiv.innerHTML = recipeHTML;
      recipeDiv.style.position = 'fixed';
      recipeDiv.style.top = '0';
      recipeDiv.style.left = '0';
      recipeDiv.style.width = '450px';
      recipeDiv.style.maxWidth = '450px';
      recipeDiv.style.background = 'white';
      recipeDiv.style.zIndex = '-1';
      document.body.appendChild(recipeDiv);

      try {
        await waitForImages(recipeDiv);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const recipePages = splitContentIntoPages(recipeDiv, pageHeightPx);
        
        // Track the first page of this recipe (accounting for TOC pages that will be added)
        const recipeFirstPage = currentPage;
        
        for (let j = 0; j < recipePages.length; j++) {
          const pageDiv = recipePages[j];
          pageDiv.style.position = 'fixed';
          pageDiv.style.top = '0';
          pageDiv.style.left = '0';
          pageDiv.style.zIndex = '-1';
          document.body.appendChild(pageDiv);
          
          try {
            await waitForImages(pageDiv);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(pageDiv, {
              scale: 3,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              width: 450,
              height: pageDiv.scrollHeight,
              windowWidth: 450,
              windowHeight: pageDiv.scrollHeight,
              letterRendering: true,
              allowTaint: false,
              removeContainer: false,
              imageTimeout: 15000,
              onclone: (clonedDoc) => {
                const clonedBody = clonedDoc.body;
                clonedBody.style.webkitFontSmoothing = 'antialiased';
                clonedBody.style.mozOsxFontSmoothing = 'grayscale';
                clonedBody.style.textRendering = 'optimizeLegibility';
              }
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * contentWidth) / canvas.width;
            contentPages.push({ imgData, imgHeight, pageNumber: currentPage });
            currentPage++;
          } finally {
            document.body.removeChild(pageDiv);
          }
        }
        
        // Store recipe with its first page number (will be adjusted for TOC pages)
        recipePageMap.push({ recipe, pageNumber: recipeFirstPage });
      } finally {
        document.body.removeChild(recipeDiv);
      }
    }
  }

  // First, determine how many TOC pages we'll have (estimate)
  // We'll generate TOC, see how many pages, then adjust page numbers
  // Note: Title page will be page 1, so TOC pages start from page 2
  const tocHTML = createTOCHTML(recipePageMap.map(({ recipe, pageNumber }) => ({ 
    recipe, 
    pageNumber: pageNumber + 1 // Temporary estimate, will be adjusted
  })), mealTypes);
  const tocDiv = document.createElement('div');
  tocDiv.innerHTML = tocHTML;
  tocDiv.style.position = 'fixed';
  tocDiv.style.top = '0';
  tocDiv.style.left = '0';
  tocDiv.style.width = '450px';
  tocDiv.style.maxWidth = '450px';
  tocDiv.style.background = 'white';
  tocDiv.style.zIndex = '-1';
  document.body.appendChild(tocDiv);

  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    const tocPages = splitContentIntoPages(tocDiv, pageHeightPx);
    // Title page (1) + TOC pages
    const tocPageCount = 1 + tocPages.length;
    
    // Adjust page numbers in recipePageMap to account for title page + TOC pages
    const adjustedRecipePageMap = recipePageMap.map(({ recipe, pageNumber }) => ({
      recipe,
      pageNumber: pageNumber + tocPageCount
    }));
    
    // Regenerate TOC with correct page numbers
    const correctedTocHTML = createTOCHTML(adjustedRecipePageMap, mealTypes);
    tocDiv.innerHTML = correctedTocHTML;
    await new Promise(resolve => setTimeout(resolve, 100));
    const correctedTocPages = splitContentIntoPages(tocDiv, pageHeightPx);
    
    // Build final PDF: Title page first, then TOC, then content
    const doc = new jsPDF('p', 'mm', 'a5');
    
    // Add title page
    const titleHTML = createTitlePageHTML();
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = titleHTML;
    titleDiv.style.position = 'fixed';
    titleDiv.style.top = '0';
    titleDiv.style.left = '0';
    titleDiv.style.width = '450px';
    titleDiv.style.maxWidth = '450px';
    titleDiv.style.background = 'white';
    titleDiv.style.zIndex = '-1';
    document.body.appendChild(titleDiv);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await addPageToPDF(doc, titleDiv, contentWidth, pageHeightPx);
    } finally {
      document.body.removeChild(titleDiv);
    }
    
    // Add TOC pages
    for (let i = 0; i < correctedTocPages.length; i++) {
      doc.addPage();
      
      const pageDiv = correctedTocPages[i];
      pageDiv.style.position = 'fixed';
      pageDiv.style.top = '0';
      pageDiv.style.left = '0';
      pageDiv.style.zIndex = '-1';
      document.body.appendChild(pageDiv);
      
      try {
        await addPageToPDF(doc, pageDiv, contentWidth, pageHeightPx);
      } finally {
        document.body.removeChild(pageDiv);
      }
    }
    
    // Now add all content pages with proper dimensions
    for (const contentPage of contentPages) {
      doc.addPage();
      doc.addImage(contentPage.imgData, 'PNG', margin, margin, contentWidth, contentPage.imgHeight, undefined, 'FAST');
    }
    
    doc.save('Успяваме-заедно-всички-рецепти-2025.pdf');
  } finally {
    document.body.removeChild(tocDiv);
  }
}
