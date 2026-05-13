import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getRecipeImage } from './recipeImage';
import { MEAL_TYPE_LABELS } from './mealTypes';

/** A5 portrait in mm — explicit array so MediaBox and viewer “page size” match rendered content */
const PDF_PAGE_FORMAT_MM = [148, 210];
const PDF_MARGIN_MM = 15;
const PDF_PAGE_W_MM = 148;
const PDF_PAGE_H_MM = 210;
/** Printable area inside margins (must match html2canvas layout width/height budget) */
const PDF_CONTENT_WIDTH_MM = PDF_PAGE_W_MM - 2 * PDF_MARGIN_MM;
const PDF_CONTENT_HEIGHT_MM = PDF_PAGE_H_MM - 2 * PDF_MARGIN_MM;

/** CSS px at 96dpi — matches jsPDF content box so raster fills width/height without extra letterboxing */
function mmToCssPx(mm) {
  return Math.round((mm * 96) / 25.4);
}
const PDF_CONTENT_WIDTH_PX = mmToCssPx(PDF_CONTENT_WIDTH_MM);
const PDF_CONTENT_HEIGHT_PX = mmToCssPx(PDF_CONTENT_HEIGHT_MM);
/** Full physical page in CSS px — used for bleed cover (no margins). */
const PDF_PAGE_WIDTH_PX = mmToCssPx(PDF_PAGE_W_MM);
const PDF_PAGE_HEIGHT_PX = mmToCssPx(PDF_PAGE_H_MM);

/** Footer page number (mm from bottom of physical page). */
const PDF_RECIPE_PAGE_NUMBER_FROM_BOTTOM_MM = 5;

function createA5PdfDocument(properties) {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: PDF_PAGE_FORMAT_MM,
  });
  if (properties && typeof properties === 'object') {
    doc.setProperties(properties);
  }
  return doc;
}

function addA5Page(doc) {
  doc.addPage(PDF_PAGE_FORMAT_MM);
}

/**
 * Centered page index at the bottom of the current page (recipe body only — not TOC/cover).
 * Uses document page index so it matches TOC entries.
 */
function drawRecipeFooterPageNumber(doc) {
  const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(55, 55, 55);
  const y = PDF_PAGE_H_MM - PDF_RECIPE_PAGE_NUMBER_FROM_BOTTOM_MM;
  doc.text(String(pageNum), PDF_PAGE_W_MM / 2, y, { align: 'center' });
}

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
      htmlContent += `<h4 style="font-size: 15px; font-weight: bold; margin: 10px 0 6px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(4)}</h4>`;
      return;
    }

    if (trimmedLine.startsWith('#### ')) {
      htmlContent += `<h5 style="font-size: 15px; font-weight: bold; margin: 10px 0 6px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(4)}</h5>`;
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      htmlContent += `<h2 style="font-size: 18px; font-weight: bold; margin: 14px 0 10px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(2)}</h2>`;
      return;
    }

    // Handle lists
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="font-size: 15px; margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">• ${text}</p>`;
      return;
    }

    // Handle numbered lists (prefix with index like bullet lists use •)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
    if (numberedMatch) {
      const index = numberedMatch[1];
      const text = numberedMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="font-size: 15px; margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">${index}. ${text}</p>`;
      return;
    }

    // Handle bold text
    let processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Regular paragraph - add page-break-before if needed
    htmlContent += `<p style="font-size: 15px; margin: 6px 0; line-height: 1.6; page-break-inside: avoid; orphans: 2; widows: 2; ">${processedLine}</p>`;
  });

  const hasImage = recipe.photo && recipe.photo.trim() !== '';
  const recipeImage = getRecipeImage(recipe.photo, recipe.title);
  const W = PDF_CONTENT_WIDTH_PX;
  return `
    <div class="pdf-recipe-root" style="font-family: 'Times New Roman', Times, serif; color: #000000; background: white; width: ${W}px; max-width: ${W}px; box-sizing: border-box;">
      <div class="pdf-recipe-meal-header" style="margin: 0 0 14px 0; padding-bottom: 10px; border-bottom: 2px solid #000000;">
        <p style="font-size: 17px; font-weight: bold; margin: 0; color: #000000; word-wrap: break-word;">${mealTypeLabel}</p>
      </div>
      <div class="pdf-recipe-title-row" style="display: flex; align-items: flex-start; margin-bottom: 16px; gap: 20px;">
        <div style="flex: 1; min-width: 0;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #000000; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;">${recipe.title}</h1>
        </div>
      </div>
      <div class="pdf-recipe-meta" style="margin-bottom: 20px; color: #000000; font-size: 11px;">
        <p style="margin: 4px 0;">Автор: ${recipe.author}</p>
      </div>
      <div class="pdf-recipe-body" style="margin-bottom: 20px;">
        ${hasImage ? 
          `<div class="pdf-recipe-float-wrap" style="float: right; margin-left: 12px; margin-bottom: 10px; width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="${recipeImage}" alt="${recipe.title}" style="width: 100%; height: auto; display: block;" />
          </div>`
        : ''}
        <div class="pdf-recipe-content" style="margin-top: 0;">
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
      htmlContent += `<h3 style="font-size: 15px; font-weight: bold; margin: 12px 0 8px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(3)}</h3>`;
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      htmlContent += `<h4 style="font-size: 14px; font-weight: bold; margin: 10px 0 6px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(4)}</h4>`;
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      htmlContent += `<h2 style="font-size: 17px; font-weight: bold; margin: 14px 0 10px 0; page-break-after: avoid; orphans: 3; widows: 3;">${trimmedLine.substring(2)}</h2>`;
      return;
    }

    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="font-size: 14px; margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">• ${text}</p>`;
      return;
    }

    const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
    if (numberedMatch) {
      const index = numberedMatch[1];
      const text = numberedMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlContent += `<p style="font-size: 14px; margin: 4px 0; padding-left: 20px; page-break-inside: avoid; orphans: 2; widows: 2;">${index}. ${text}</p>`;
      return;
    }

    let processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    htmlContent += `<p style="font-size: 14px; margin: 6px 0; line-height: 1.6; page-break-inside: avoid; orphans: 2; widows: 2;">${processedLine}</p>`;
  });

  const hasImage = recipe.photo && recipe.photo.trim() !== '';
  const recipeImage = getRecipeImage(recipe.photo, recipe.title);
  const W = PDF_CONTENT_WIDTH_PX;
  return `
    <div class="pdf-recipe-root" style="color: #000000; font-family: 'Times New Roman', Times, serif; background: white; width: ${W}px; max-width: ${W}px; box-sizing: border-box;">
      <div class="pdf-recipe-meal-header" style="margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #000000;">
        <p style="font-size: 16px; font-weight: bold; margin: 0; color: #000000; word-wrap: break-word;">${mealTypeLabel}</p>
      </div>
      <div class="pdf-recipe-title-row" style="display: flex; align-items: flex-start; margin-bottom: 16px; gap: 20px;">
        <div style="flex: 1; min-width: 0;">
          <h1 style="font-size: 22px; font-weight: bold; margin: 0; color: #000000; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.3;">${recipe.title}</h1>
        </div>
      </div>
      <div class="pdf-recipe-meta" style="margin-bottom: 20px; color: #000000; font-size: 11px;">
        <p style="margin: 4px 0;">Автор: ${recipe.author}</p>
      </div>
      <div class="pdf-recipe-body" style="margin-bottom: 20px;">
        ${hasImage ? 
        `<div class="pdf-recipe-float-wrap" style="float: right; margin-left: 12px; margin-bottom: 10px; width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <img src="${recipeImage}" alt="${recipe.title}" style="width: 100%; height: auto; display: block;" />
        </div>`
        : ''}
        <div class="pdf-recipe-content" style="margin-top: 0;">
          ${htmlContent}
        </div>
        <div style="clear: both;"></div>
      </div>
    </div>
  `;
}

/**
 * Full-bleed cover HTML (single page, edge-to-edge image — no margin band).
 */
function createCoverPageHTML() {
  const H = PDF_PAGE_HEIGHT_PX;
  const W = PDF_PAGE_WIDTH_PX;
  return `
    <div class="pdf-cover-root" style="width: ${W}px; height: ${H}px; box-sizing: border-box; margin: 0; padding: 0; overflow: hidden; background: #000000;">
      <img src="/images/book.png" alt="" style="width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; margin: 0; padding: 0;" />
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
      tocHTML += `<h3 style="font-size: 16px; font-weight: bold; margin: 20px 0 8px 0; color: #000000; border-top: 1px solid #e0e0e0;">${mealTypeLabel}</h3>`;
      currentMealType = recipe.mealType;
    }
    
    tocHTML += `<p style="margin: 4px 0; padding-left: 20px; font-size: 12px; display: flex; align-items: flex-end; gap: 2px;">
      <span style="flex-shrink: 0;">${recipe.title}</span>
      <span style="flex: 1; border-bottom: 1px dotted #000000; height: 1px;"></span>
      <span style="color: #000000; font-weight: normal; flex-shrink: 0; min-width: 14px; text-align: right;">${pageNumber}</span>
    </p>`;
  });

  const W = PDF_CONTENT_WIDTH_PX;
  return `
    <div class="pdf-toc-root" style="font-family: 'Times New Roman', Times, serif; color: #000000; background: white; width: ${W}px; max-width: ${W}px; box-sizing: border-box;">
      <h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 10px 0;">Съдържание</h2>
      ${tocHTML}
    </div>
  `;
}

/** Mount off-screen so float / wrap layout yields real scrollHeight (not used during capture min-height stretch). */
function ensurePdfPageMeasureHost(pageDiv) {
  if (!pageDiv.parentNode) {
    pageDiv.style.position = 'absolute';
    pageDiv.style.left = '-9999px';
    pageDiv.style.top = '0';
    document.body.appendChild(pageDiv);
  }
  void pageDiv.offsetHeight;
}

function detachPdfPageMeasureHost(pageDiv) {
  if (pageDiv.parentNode) {
    pageDiv.parentNode.removeChild(pageDiv);
  }
}

function measurePdfPageShellHeightPx(pageDiv) {
  ensurePdfPageMeasureHost(pageDiv);
  return pageDiv.scrollHeight;
}

/** Full-height slice for raster export (after pagination is done). */
function stretchPdfPageShellForCapture(pageDiv) {
  pageDiv.style.minHeight = `${PDF_CONTENT_HEIGHT_PX}px`;
}

/** Empty TOC continuation shell (same layout as `splitContentIntoPages` continuation pages). */
function createTocContinuationShell() {
  const shell = document.createElement('div');
  shell.style.width = `${PDF_CONTENT_WIDTH_PX}px`;
  shell.style.background = 'white';
  shell.style.boxSizing = 'border-box';
  shell.style.padding = '0';
  shell.style.margin = '0';
  shell.style.fontFamily = "'Times New Roman', Times, serif";
  const inner = document.createElement('div');
  inner.className = 'pdf-recipe-content';
  inner.style.marginTop = '0';
  shell.appendChild(inner);
  return shell;
}

/**
 * If a TOC page ends with a meal-type heading (h3) as its last block, move that h3 to the
 * next page so the section title is not orphaned at the bottom. Ripples overflow if needed.
 */
function relocateTocTrailingMealTypeHeaders(pages, maxContentHeightPx) {
  const safetyPx = 6;
  const maxFit = maxContentHeightPx - safetyPx;

  /**
   * @param {number} startIdx
   */
  function rippleTocOverflowForward(startIdx) {
    for (let j = startIdx; j < pages.length; j++) {
      let iterations = 0;
      while (measurePdfPageShellHeightPx(pages[j]) > maxFit && iterations < 200) {
        iterations += 1;
        const host = pages[j].querySelector('.pdf-recipe-content');
        if (!host || host.childNodes.length <= 1) {
          break;
        }
        const move = host.lastElementChild;
        if (!move) {
          break;
        }
        host.removeChild(move);
        if (j + 1 >= pages.length) {
          const fresh = createTocContinuationShell();
          const freshHost = fresh.querySelector('.pdf-recipe-content');
          if (freshHost) {
            freshHost.appendChild(move);
          }
          pages.push(fresh);
        } else {
          const nh = pages[j + 1].querySelector('.pdf-recipe-content');
          if (nh) {
            nh.insertBefore(move, nh.firstChild);
          }
        }
      }
    }
  }

  let pass = 0;
  let changed = true;
  while (changed && pass < pages.length + 8) {
    pass += 1;
    changed = false;
    for (let i = 0; i < pages.length - 1; i++) {
      const host = pages[i].querySelector('.pdf-recipe-content');
      const nextHost = pages[i + 1].querySelector('.pdf-recipe-content');
      if (!host || !nextHost) {
        continue;
      }
      const last = host.lastElementChild;
      if (!last || last.tagName !== 'H3') {
        continue;
      }

      changed = true;
      host.removeChild(last);
      nextHost.insertBefore(last, nextHost.firstChild);

      if (host.childNodes.length === 0) {
        pages.splice(i, 1);
        rippleTocOverflowForward(i);
      } else {
        rippleTocOverflowForward(i + 1);
      }
      break;
    }
  }

  pages.forEach((p) => detachPdfPageMeasureHost(p));
}

/**
 * Split recipe / TOC HTML into page slices that each fit in the PDF content box (width × height in CSS px).
 * Uses laid-out scrollHeight after each block (correct for float + text wrap); does not stack image height over text.
 */
function splitContentIntoPages(div, maxContentHeightPx = PDF_CONTENT_HEIGHT_PX) {
  const pages = [];
  const W = PDF_CONTENT_WIDTH_PX;
  const clone = div.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = `${W}px`;
  clone.style.height = 'auto';
  document.body.appendChild(clone);

  const titleRow = clone.querySelector('.pdf-recipe-title-row');
  const metadataBlock = clone.querySelector('.pdf-recipe-meta');
  const bodyBlock = clone.querySelector('.pdf-recipe-body');
  const contentSource = clone.querySelector('.pdf-recipe-content');
  const floatWrap = clone.querySelector('.pdf-recipe-float-wrap');
  const tocRoot = clone.querySelector('.pdf-toc-root');

  /** @type {HTMLElement[]} */
  let flowElements = [];
  if (tocRoot) {
    flowElements = Array.from(tocRoot.querySelectorAll('h2, h3, p'));
  } else if (contentSource) {
    flowElements = Array.from(contentSource.querySelectorAll('p, h2, h3, h4, h5, h6'));
  }

  const safetyPx = 6;

  function newPageShell(includeHeader) {
    const shell = document.createElement('div');
    shell.style.width = `${W}px`;
    shell.style.background = 'white';
    shell.style.boxSizing = 'border-box';
    shell.style.padding = '0';
    shell.style.margin = '0';
    shell.style.fontFamily = "'Times New Roman', Times, serif";

    let contentHost = shell;
    if (includeHeader && titleRow) {
      shell.appendChild(titleRow.cloneNode(true));
    }
    if (includeHeader && metadataBlock) {
      shell.appendChild(metadataBlock.cloneNode(true));
    }

    if (includeHeader && bodyBlock && floatWrap) {
      const bodyClone = bodyBlock.cloneNode(false);
      const floatClone = floatWrap.cloneNode(true);
      const inner = document.createElement('div');
      inner.className = 'pdf-recipe-content';
      inner.style.marginTop = '0';
      const clearer = document.createElement('div');
      clearer.style.clear = 'both';
      clearer.style.height = '0';
      clearer.style.margin = '0';
      clearer.style.padding = '0';
      bodyClone.appendChild(floatClone);
      bodyClone.appendChild(inner);
      bodyClone.appendChild(clearer);
      shell.appendChild(bodyClone);
      contentHost = inner;
    } else if (includeHeader && bodyBlock) {
      const bodyClone = bodyBlock.cloneNode(false);
      const inner = document.createElement('div');
      inner.className = 'pdf-recipe-content';
      inner.style.marginTop = '0';
      bodyClone.appendChild(inner);
      shell.appendChild(bodyClone);
      contentHost = inner;
    } else {
      const inner = document.createElement('div');
      inner.className = 'pdf-recipe-content';
      inner.style.marginTop = '0';
      shell.appendChild(inner);
      contentHost = inner;
    }

    return { shell, contentHost };
  }

  if (flowElements.length === 0) {
    const { shell } = newPageShell(!!titleRow || !!tocRoot);
    pages.push(shell);
    document.body.removeChild(clone);
    return pages;
  }

  let { shell: currentPage, contentHost: targetContainer } = newPageShell(!!titleRow || !!tocRoot);

  flowElements.forEach((element) => {
    const cloneEl = element.cloneNode(true);
    targetContainer.appendChild(cloneEl);

    const totalH = measurePdfPageShellHeightPx(currentPage);

    if (totalH > maxContentHeightPx - safetyPx && targetContainer.childNodes.length > 1) {
      targetContainer.removeChild(cloneEl);
      detachPdfPageMeasureHost(currentPage);
      pages.push(currentPage);

      ({ shell: currentPage, contentHost: targetContainer } = newPageShell(false));
      targetContainer.appendChild(cloneEl);
      measurePdfPageShellHeightPx(currentPage);
    }
  });

  detachPdfPageMeasureHost(currentPage);
  if (currentPage && (targetContainer.childNodes.length > 0 || pages.length === 0)) {
    pages.push(currentPage);
  }

  if (tocRoot) {
    relocateTocTrailingMealTypeHeaders(pages, maxContentHeightPx);
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
  tempDiv.style.width = `${PDF_CONTENT_WIDTH_PX}px`;
  tempDiv.style.maxWidth = `${PDF_CONTENT_WIDTH_PX}px`;
  tempDiv.style.background = 'white';
  tempDiv.style.zIndex = '-1';
  document.body.appendChild(tempDiv);

  try {
    // Wait for images to load
    await waitForImages(tempDiv);
    await new Promise(resolve => setTimeout(resolve, 200));

    const pages = splitContentIntoPages(tempDiv);

  const doc = createA5PdfDocument({
    title: recipe.title,
    subject: 'Успяваме заедно — рецепта',
    author: recipe.author || 'Група „Звездичка“',
    keywords: 'рецепти, здравословно',
    creator: 'Книга със здравословни рецепти — Звездичка',
  });

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        addA5Page(doc);
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

        stretchPdfPageShellForCapture(pageDiv);
        const capH = Math.max(pageDiv.scrollHeight, PDF_CONTENT_HEIGHT_PX);
        const canvas = await html2canvas(pageDiv, {
          scale: 3, // Increased from 2 to 3 for better resolution (Print as PDF quality)
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: PDF_CONTENT_WIDTH_PX,
          height: capH,
          windowWidth: PDF_CONTENT_WIDTH_PX,
          windowHeight: capH,
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

        const imgData = canvas.toDataURL('image/png');
        doc.addImage(
          imgData,
          'PNG',
          PDF_MARGIN_MM,
          PDF_MARGIN_MM,
          PDF_CONTENT_WIDTH_MM,
          PDF_CONTENT_HEIGHT_MM,
          undefined,
          'FAST'
        );
        drawRecipeFooterPageNumber(doc);
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
function addPageToPDF(doc, pageDiv) {
  return new Promise(async (resolve) => {
    try {
      await waitForImages(pageDiv);
      await new Promise(resolve => setTimeout(resolve, 100));

      stretchPdfPageShellForCapture(pageDiv);
      const capH = Math.max(pageDiv.scrollHeight, PDF_CONTENT_HEIGHT_PX);
      const canvas = await html2canvas(pageDiv, {
        scale: 3, // Increased from 2 to 3 for better resolution (Print as PDF quality)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: PDF_CONTENT_WIDTH_PX,
        height: capH,
        windowWidth: PDF_CONTENT_WIDTH_PX,
        windowHeight: capH,
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

      const imgData = canvas.toDataURL('image/png');
      doc.addImage(
        imgData,
        'PNG',
        PDF_MARGIN_MM,
        PDF_MARGIN_MM,
        PDF_CONTENT_WIDTH_MM,
        PDF_CONTENT_HEIGHT_MM,
        undefined,
        'FAST'
      );
      
      resolve(doc.internal.getCurrentPageInfo().pageNumber);
    } catch (error) {
      console.error('Error adding page to PDF:', error);
      resolve(doc.internal.getCurrentPageInfo().pageNumber);
    }
  });
}

/**
 * First page: full A5 bleed from /images/book.png (no white margin frame).
 */
async function addFullBleedCoverPageToPDF(doc) {
  const wrap = document.createElement('div');
  wrap.innerHTML = createCoverPageHTML();
  const pageShell = wrap.firstElementChild;
  if (!pageShell || !(pageShell instanceof HTMLElement)) {
    return;
  }
  pageShell.style.position = 'fixed';
  pageShell.style.top = '0';
  pageShell.style.left = '0';
  pageShell.style.zIndex = '-1';
  document.body.appendChild(pageShell);

  try {
    await waitForImages(pageShell);
    await new Promise((resolve) => setTimeout(resolve, 150));

    const W = PDF_PAGE_WIDTH_PX;
    const H = PDF_PAGE_HEIGHT_PX;
    const canvas = await html2canvas(pageShell, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      width: W,
      height: H,
      windowWidth: W,
      windowHeight: H,
      letterRendering: true,
      allowTaint: false,
      removeContainer: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedBody = clonedDoc.body;
        clonedBody.style.webkitFontSmoothing = 'antialiased';
        clonedBody.style.mozOsxFontSmoothing = 'grayscale';
        clonedBody.style.textRendering = 'optimizeLegibility';
      },
    });

    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, PDF_PAGE_W_MM, PDF_PAGE_H_MM, undefined, 'FAST');
  } catch (error) {
    console.error('Error adding cover page to PDF:', error);
  } finally {
    document.body.removeChild(pageShell);
  }
}

/**
 * Generate PDF with all recipes - grouped by mealType (meal type on each recipe page) and TOC with page numbers
 * @param {object[]} recipes
 * @param {{ value: string, label: string }[]} mealTypes
 * @param {{ returnAs?: 'arraybuffer', saveFilename?: string }} [options] — use returnAs: 'arraybuffer' for programmatic export (e.g. CLI); default triggers browser download
 */
export async function generateAllRecipesPDF(recipes, mealTypes, options = {}) {
  const { returnAs, saveFilename } = options;
  await waitForFonts();

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
    const mealTypeRecipes = recipesByMealType[mealType];

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
      recipeDiv.style.width = `${PDF_CONTENT_WIDTH_PX}px`;
      recipeDiv.style.maxWidth = `${PDF_CONTENT_WIDTH_PX}px`;
      recipeDiv.style.background = 'white';
      recipeDiv.style.zIndex = '-1';
      document.body.appendChild(recipeDiv);

      try {
        await waitForImages(recipeDiv);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const recipePages = splitContentIntoPages(recipeDiv);
        
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

            stretchPdfPageShellForCapture(pageDiv);
            const capH = Math.max(pageDiv.scrollHeight, PDF_CONTENT_HEIGHT_PX);
            const canvas = await html2canvas(pageDiv, {
              scale: 3,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              width: PDF_CONTENT_WIDTH_PX,
              height: capH,
              windowWidth: PDF_CONTENT_WIDTH_PX,
              windowHeight: capH,
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
            contentPages.push({ imgData, pageNumber: currentPage, kind: 'recipe' });
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
  tocDiv.style.width = `${PDF_CONTENT_WIDTH_PX}px`;
  tocDiv.style.maxWidth = `${PDF_CONTENT_WIDTH_PX}px`;
  tocDiv.style.background = 'white';
  tocDiv.style.zIndex = '-1';
  document.body.appendChild(tocDiv);

  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    const tocPages = splitContentIntoPages(tocDiv);
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
    const correctedTocPages = splitContentIntoPages(tocDiv);
    
    // Build final PDF: Title page first, then TOC, then content
    const doc = createA5PdfDocument({
      title: 'Книга със здравословни рецепти',
      subject: 'Успяваме заедно — всички рецепти',
      author: 'Група „Звездичка“ към ДГ „Слънчев дом“',
      keywords: 'рецепти, здравословно',
      creator: 'Книга със здравословни рецепти — Звездичка',
    });
    
    // Add full-bleed cover (book artwork — entire physical page, no margin band)
    await addFullBleedCoverPageToPDF(doc);
    
    // Add TOC pages
    for (let i = 0; i < correctedTocPages.length; i++) {
      addA5Page(doc);
      
      const pageDiv = correctedTocPages[i];
      pageDiv.style.position = 'fixed';
      pageDiv.style.top = '0';
      pageDiv.style.left = '0';
      pageDiv.style.zIndex = '-1';
      document.body.appendChild(pageDiv);
      
      try {
        await addPageToPDF(doc, pageDiv);
      } finally {
        document.body.removeChild(pageDiv);
      }
    }
    
    // Now add all content pages with proper dimensions
    for (const contentPage of contentPages) {
      addA5Page(doc);
      doc.addImage(
        contentPage.imgData,
        'PNG',
        PDF_MARGIN_MM,
        PDF_MARGIN_MM,
        PDF_CONTENT_WIDTH_MM,
        PDF_CONTENT_HEIGHT_MM,
        undefined,
        'FAST'
      );
      if (contentPage.kind === 'recipe') {
        drawRecipeFooterPageNumber(doc);
      }
    }
    
    if (returnAs === 'arraybuffer') {
      return doc.output('arraybuffer');
    }
    doc.save(saveFilename || 'Успяваме-заедно-всички-рецепти-2025.pdf');
  } finally {
    document.body.removeChild(tocDiv);
  }
}
