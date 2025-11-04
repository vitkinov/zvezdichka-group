import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
      htmlContent += `<h3 style="font-size: 16px; font-weight: bold; margin: 12px 0 8px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(3)}</h3>`;
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      htmlContent += `<h4 style="font-size: 14px; font-weight: bold; margin: 10px 0 6px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(4)}</h4>`;
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      htmlContent += `<h2 style="font-size: 18px; font-weight: bold; margin: 14px 0 10px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(2)}</h2>`;
      return;
    }

    // Handle lists
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">• ${text}</p>`;
      return;
    }

    // Handle numbered lists
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      const text = numberedMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">${trimmedLine}</p>`;
      return;
    }

    // Handle bold text
    let processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Regular paragraph - add page-break-before if needed
    htmlContent += `<p style="margin: 6px 0; line-height: 1.6; page-break-inside: avoid; orphans: 2; widows: 2; page-break-before: auto;">${processedLine}</p>`;
  });

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif; padding: 20px; color: #333; background: white; width: 794px; box-sizing: border-box;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 16px; gap: 20px;">
        <div style="flex: 1; min-width: 0;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #2c3e50; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;">${recipe.title}</h1>
        </div>
      </div>
      <div style="margin-bottom: 20px; color: #666; font-size: 12px;">
        <p style="margin: 4px 0;">Тип: ${mealTypeLabel}</p>
        <p style="margin: 4px 0;">Автор: ${recipe.author}</p>
      </div>
      <div style="margin-top: 20px;">
        ${htmlContent}
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
      htmlContent += `<h3 style="font-size: 15px; font-weight: bold; margin: 12px 0 8px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(3)}</h3>`;
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      htmlContent += `<h4 style="font-size: 13px; font-weight: bold; margin: 10px 0 6px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(4)}</h4>`;
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      htmlContent += `<h2 style="font-size: 17px; font-weight: bold; margin: 14px 0 10px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(2)}</h2>`;
      return;
    }

    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">• ${text}</p>`;
      return;
    }

    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      const text = numberedMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">${trimmedLine}</p>`;
      return;
    }

    let processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    htmlContent += `<p style="margin: 6px 0; line-height: 1.6; page-break-inside: avoid; orphans: 2; widows: 2;">${processedLine}</p>`;
  });

  return `
    <div style="padding: 20px; color: #333; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif; background: white; width: 794px; box-sizing: border-box;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 16px; gap: 20px;">
        <div style="flex: 1; min-width: 0;">
          <h1 style="font-size: 22px; font-weight: bold; margin: 0; color: #2c3e50; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;">${recipe.title}</h1>
        </div>
      </div>
      <div style="margin-bottom: 20px; color: #666; font-size: 11px;">
        <p style="margin: 4px 0;">Тип: ${mealTypeLabel}</p>
        <p style="margin: 4px 0;">Автор: ${recipe.author}</p>
      </div>
      <div style="margin-top: 20px;">
        ${htmlContent}
      </div>
    </div>
  `;
}

/**
 * Create HTML content for table of contents
 */
function createTOCHTML(recipes, mealTypes) {
  let tocHTML = '';
  recipes.forEach((recipe, index) => {
    const mealTypeLabel = mealTypes.find(mt => mt.value === recipe.mealType)?.label || recipe.mealType;
    tocHTML += `<p style="margin: 6px 0; padding-left: 10px; font-size: 12px;">${index + 1}. ${recipe.title} - ${mealTypeLabel}</p>`;
  });

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif; padding: 20px; color: #333; background: white; width: 794px; box-sizing: border-box;">
      <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #2c3e50; text-align: center;">Книга със здравословни рецепти</h1>
      <p style="margin-bottom: 20px; color: #666; text-align: center;">Общо рецепти: ${recipes.length}</p>
      <h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 10px 0;">Съдържание</h2>
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
  currentPage.style.width = '794px';
  currentPage.style.background = 'white';
  currentPage.style.padding = '20px';
  currentPage.style.boxSizing = 'border-box';
  currentPage.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif";
  let currentHeight = 40; // Start with padding
  
  // Find title/image header, metadata divs, and content div
  const titleHeaderDiv = clone.querySelector('div[style*="display: flex"]');
  const title = clone.querySelector('h1');
  const metadataDiv = clone.querySelector('div:not([style*="display: flex"])');
  const contentDiv = clone.querySelector('div:last-of-type');
  
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
      currentPage.style.width = '794px';
      currentPage.style.background = 'white';
      currentPage.style.padding = '20px';
      currentPage.style.boxSizing = 'border-box';
      currentPage.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif";
      currentHeight = 40; // Reset with padding
    }
    
    // Add element to current page
    currentPage.appendChild(element.cloneNode(true));
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
  tempDiv.style.width = '794px';
  tempDiv.style.maxWidth = '794px';
  tempDiv.style.background = 'white';
  tempDiv.style.zIndex = '-1';
  document.body.appendChild(tempDiv);

  try {
    // Wait for images to load
    await waitForImages(tempDiv);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Calculate page height in pixels (A4 at 96 DPI)
    const pageHeightPx = 1123; // 297mm at 96 DPI
    
    // Split content into pages with smart breaks
    const pages = splitContentIntoPages(tempDiv, pageHeightPx);
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
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
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794,
          height: pageDiv.scrollHeight,
          windowWidth: 794,
          windowHeight: pageDiv.scrollHeight,
          letterRendering: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
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
 * Generate PDF with all recipes - each recipe on a new page
 */
export async function generateAllRecipesPDF(recipes, mealTypes) {
  await waitForFonts();
  
  const doc = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 297;
  const pageHeightPx = 1123; // 297mm at 96 DPI

  // Add table of contents
  const tocHTML = createTOCHTML(recipes, mealTypes);
  const tocDiv = document.createElement('div');
  tocDiv.innerHTML = tocHTML;
  tocDiv.style.position = 'fixed';
  tocDiv.style.top = '0';
  tocDiv.style.left = '0';
  tocDiv.style.width = '794px';
  tocDiv.style.maxWidth = '794px';
  tocDiv.style.background = 'white';
  tocDiv.style.zIndex = '-1';
  document.body.appendChild(tocDiv);

  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const tocPages = splitContentIntoPages(tocDiv, pageHeightPx);
    
    for (let i = 0; i < tocPages.length; i++) {
      if (i > 0) {
        doc.addPage();
      }
      
      const pageDiv = tocPages[i];
      pageDiv.style.position = 'fixed';
      pageDiv.style.top = '0';
      pageDiv.style.left = '0';
      pageDiv.style.zIndex = '-1';
      document.body.appendChild(pageDiv);
      
      try {
        // Wait for images to load on TOC page
        await waitForImages(pageDiv);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(pageDiv, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794,
          height: pageDiv.scrollHeight,
          windowWidth: 794,
          windowHeight: pageDiv.scrollHeight,
          letterRendering: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } finally {
        document.body.removeChild(pageDiv);
      }
    }

    // Add each recipe on a new page
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const mealTypeLabel = mealTypes.find(mt => mt.value === recipe.mealType)?.label || recipe.mealType;
      const recipeHTML = createSingleRecipeHTML(recipe, mealTypeLabel);
      
      const recipeDiv = document.createElement('div');
      recipeDiv.innerHTML = recipeHTML;
      recipeDiv.style.position = 'fixed';
      recipeDiv.style.top = '0';
      recipeDiv.style.left = '0';
      recipeDiv.style.width = '794px';
      recipeDiv.style.maxWidth = '794px';
      recipeDiv.style.background = 'white';
      recipeDiv.style.zIndex = '-1';
      document.body.appendChild(recipeDiv);

      try {
        // Wait for images to load
        await waitForImages(recipeDiv);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Split recipe into pages with smart breaks
        const recipePages = splitContentIntoPages(recipeDiv, pageHeightPx);
        
        for (let j = 0; j < recipePages.length; j++) {
          // Add new page before each recipe (except first page of first recipe)
          if (i > 0 || j > 0) {
            doc.addPage();
          }
          
          const pageDiv = recipePages[j];
          pageDiv.style.position = 'fixed';
          pageDiv.style.top = '0';
          pageDiv.style.left = '0';
          pageDiv.style.zIndex = '-1';
          document.body.appendChild(pageDiv);
          
          try {
            // Wait for images to load on recipe page
            await waitForImages(pageDiv);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(pageDiv, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              width: 794,
              height: pageDiv.scrollHeight,
              windowWidth: 794,
              windowHeight: pageDiv.scrollHeight,
              letterRendering: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          } finally {
            document.body.removeChild(pageDiv);
          }
        }
      } finally {
        document.body.removeChild(recipeDiv);
      }
    }

    doc.save('Успяваме-заедно-всички-рецепти-2025.pdf');
  } finally {
    document.body.removeChild(tocDiv);
  }
}
