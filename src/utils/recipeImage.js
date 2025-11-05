/**
 * Generate a default recipe image as an SVG data URI
 * @param {string} title - Recipe title (optional, for accessibility)
 * @returns {string} - SVG image as data URI
 */
export function generateDefaultRecipeImage(title = 'Recipe') {
  // Create a nice SVG with a recipe/utensil icon design
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <!-- Background gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.7" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="800" height="600" fill="url(#bgGradient)"/>
      
      <!-- Decorative circles -->
      <circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.1)"/>
      <circle cx="700" cy="500" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="650" cy="100" r="40" fill="rgba(255,255,255,0.15)"/>
      <circle cx="150" cy="450" r="50" fill="rgba(255,255,255,0.1)"/>
      
      <!-- Main utensil icon (fork and knife) -->
      <g transform="translate(400, 300)">
        <!-- Fork -->
        <g fill="url(#iconGradient)" opacity="0.95">
          <!-- Fork handle -->
          <rect x="-8" y="-60" width="16" height="120" rx="8"/>
          <!-- Fork prongs -->
          <rect x="-20" y="-80" width="6" height="25" rx="3"/>
          <rect x="-7" y="-80" width="6" height="25" rx="3"/>
          <rect x="7" y="-80" width="6" height="25" rx="3"/>
        </g>
        
        <!-- Knife -->
        <g fill="url(#iconGradient)" opacity="0.95" transform="translate(50, 0)">
          <!-- Knife handle -->
          <rect x="-8" y="-40" width="16" height="80" rx="8"/>
          <!-- Knife blade -->
          <path d="M 8 -40 L 35 -80 L 35 -60 L 8 -20 Z"/>
        </g>
        
        <!-- Spoon (optional decorative element) -->
        <g fill="url(#iconGradient)" opacity="0.7" transform="translate(-50, 0)">
          <!-- Spoon handle -->
          <rect x="-8" y="-30" width="16" height="60" rx="8"/>
          <!-- Spoon bowl -->
          <ellipse cx="0" y="-35" rx="12" ry="8"/>
        </g>
      </g>
      
      <!-- Recipe text (optional, subtle) -->
      <text x="400" y="450" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
            fill="rgba(255,255,255,0.3)" text-anchor="middle">Рецепта</text>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  
  // Encode SVG as data URI
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml,${encodedSvg}`;
}

/**
 * Get recipe image URL, using default if not provided
 * @param {string} imageUrl - Recipe image URL (optional)
 * @param {string} title - Recipe title (optional, for default image)
 * @returns {string} - Image URL or default image data URI
 */
export function getRecipeImage(imageUrl, title = '') {
  return imageUrl || generateDefaultRecipeImage(title);
}

