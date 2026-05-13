/**
 * Renders the full recipe book in headless Chromium (same pipeline as the in-app generator)
 * and writes public/book.pdf. Run after adding or editing recipes.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');
const esbuild = require('esbuild');
const puppeteer = require('puppeteer');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const cacheDir = path.join(__dirname, '.cache');
const genDir = path.join(publicDir, '__generated__');
const bundleOut = path.join(genDir, 'book-pdf-bundle.js');
const recipesLoaderOut = path.join(cacheDir, 'load-recipes.mjs');

function mime(ext) {
  const m = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.pdf': 'application/pdf',
    '.md': 'text/markdown; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  return m[ext] || 'application/octet-stream';
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const u = new URL(req.url || '/', 'http://127.0.0.1');
        let rel = decodeURIComponent(u.pathname);
        if (rel === '/') rel = '/book-pdf-generator.html';
        const safe = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, '');
        const filePath = path.join(publicDir, safe);
        if (!filePath.startsWith(publicDir)) {
          res.writeHead(403);
          res.end();
          return;
        }
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': mime(path.extname(filePath)) });
          res.end(data);
        });
      } catch (e) {
        res.writeHead(500);
        res.end(String(e));
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function main() {
  const cover = path.join(publicDir, 'images', 'book.png');
  if (!fs.existsSync(cover)) {
    console.warn('Warning: public/images/book.png missing — cover page may be blank.');
  }

  fs.mkdirSync(cacheDir, { recursive: true });
  fs.mkdirSync(genDir, { recursive: true });

  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'cli-recipes-loader.mjs')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: recipesLoaderOut,
    logLevel: 'warning',
    define: {
      __REPO_ROOT__: JSON.stringify(root),
    },
  });

  const { loadAllRecipesForBook } = await import(pathToFileURL(recipesLoaderOut).href);

  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'book-pdf-browser-entry.mjs')],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    outfile: bundleOut,
    logLevel: 'warning',
  });

  const { recipes, mealTypes } = loadAllRecipesForBook();
  console.log(`Building book PDF from ${recipes.length} recipes…`);

  const { server, port } = await startStaticServer();

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(600000);
    await page.goto(`http://127.0.0.1:${port}/book-pdf-generator.html`, {
      waitUntil: 'load',
      timeout: 120000,
    });
    await page.waitForFunction(() => typeof globalThis.__runBookPdf === 'function', {
      timeout: 30000,
    });
    const bytes = await page.evaluate(async (payload) =>
      globalThis.__runBookPdf(payload.recipes, payload.mealTypes)
    , { recipes, mealTypes });

    const outPdf = path.join(publicDir, 'book.pdf');
    fs.writeFileSync(outPdf, Buffer.from(bytes));
    console.log(`Wrote ${outPdf}`);
  } finally {
    if (browser) await browser.close();
    await new Promise((r) => server.close(r));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
