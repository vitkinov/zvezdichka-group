// Utility functions to parse and generate markdown recipe files

/**
 * Parse a markdown recipe file and extract recipe data
 * Expected format:
 * ---
 * title: Recipe Title
 * mealType: breakfast
 * author: Author Name
 * photo: https://example.com/image.jpg
 * ---
 * 
 * Recipe content here...
 */
export function parseRecipeMarkdown(markdown) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontMatterRegex);

  if (!match) {
    // If no front matter, try to parse as plain content
    return {
      title: '',
      mealType: 'breakfast',
      author: '',
      photo: '',
      content: markdown.trim()
    };
  }

  const frontMatter = match[1];
  const content = match[2].trim();

  // Parse front matter (YAML-like format)
  const frontMatterLines = frontMatter.split('\n');
  const metadata = {};
  
  frontMatterLines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      metadata[key] = value;
    }
  });

  return {
    title: metadata.title || '',
    mealType: metadata.mealType || 'breakfast',
    author: metadata.author || '',
    photo: metadata.photo || metadata.image || '',
    content: content
  };
}

/**
 * Generate markdown from recipe data
 */
export function generateRecipeMarkdown(recipe) {
  const frontMatter = `---
title: ${recipe.title}
mealType: ${recipe.mealType}
author: ${recipe.author}
${recipe.photo ? `photo: ${recipe.photo}` : ''}
---`;

  return `${frontMatter}\n\n${recipe.content}`;
}

/**
 * Generate a safe filename from recipe title
 */
export function generateRecipeFilename(title) {
  // Convert to lowercase, replace spaces with hyphens, remove special characters
  return title
    .toLowerCase()
    .replace(/[^a-z0-9а-я\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) + '.md';
}

/**
 * Download a markdown file
 */
export function downloadMarkdownFile(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

