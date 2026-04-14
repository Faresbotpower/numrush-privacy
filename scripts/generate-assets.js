const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// NumRush brand colors
const BG = '#0A0A0A';
const ACCENT = '#FF6B35';
const ACCENT_DARK = '#CC5529';
const WHITE = '#FFFFFF';
const SURFACE = '#1A1A1A';

async function generateIcon() {
  // 1024x1024 app icon — bold "N" with speed lines on dark bg
  const size = 1024;
  const svg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111111"/>
        <stop offset="100%" stop-color="#0A0A0A"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF8855"/>
        <stop offset="100%" stop-color="${ACCENT}"/>
      </linearGradient>
      <linearGradient id="textGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${WHITE}"/>
        <stop offset="100%" stop-color="#DDDDDD"/>
      </linearGradient>
    </defs>

    <!-- Background with rounded corners -->
    <rect width="${size}" height="${size}" rx="220" fill="url(#bg)"/>

    <!-- Subtle grid pattern -->
    <rect x="80" y="80" width="${size - 160}" height="${size - 160}" rx="160" fill="none" stroke="#1A1A1A" stroke-width="2"/>

    <!-- Speed lines (left side) -->
    <rect x="100" y="380" width="160" height="8" rx="4" fill="${ACCENT}" opacity="0.3"/>
    <rect x="140" y="420" width="120" height="8" rx="4" fill="${ACCENT}" opacity="0.2"/>
    <rect x="120" y="460" width="140" height="8" rx="4" fill="${ACCENT}" opacity="0.15"/>
    <rect x="100" y="580" width="160" height="8" rx="4" fill="${ACCENT}" opacity="0.15"/>
    <rect x="140" y="620" width="120" height="8" rx="4" fill="${ACCENT}" opacity="0.2"/>
    <rect x="120" y="660" width="140" height="8" rx="4" fill="${ACCENT}" opacity="0.3"/>

    <!-- Main "N" letter -->
    <text x="512" y="600" font-family="Arial Black, Arial, Helvetica, sans-serif"
          font-size="580" font-weight="900" fill="url(#textGrad)"
          text-anchor="middle" dominant-baseline="middle"
          letter-spacing="-20">N</text>

    <!-- Orange accent underline -->
    <rect x="280" y="780" width="464" height="16" rx="8" fill="url(#accent)"/>

    <!-- Small "R" subscript for "NumRush" hint -->
    <text x="720" y="720" font-family="Arial Black, Arial, Helvetica, sans-serif"
          font-size="180" font-weight="900" fill="url(#accent)"
          text-anchor="middle" dominant-baseline="middle">R</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));

  console.log('✓ icon.png (1024x1024)');

  // Adaptive icon foreground (Android) — same but with padding
  const adaptiveSvg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="accent2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF8855"/>
        <stop offset="100%" stop-color="${ACCENT}"/>
      </linearGradient>
      <linearGradient id="textGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${WHITE}"/>
        <stop offset="100%" stop-color="#DDDDDD"/>
      </linearGradient>
    </defs>

    <!-- Transparent bg for adaptive icon -->
    <rect width="${size}" height="${size}" fill="transparent"/>

    <!-- Speed lines -->
    <rect x="180" y="420" width="120" height="6" rx="3" fill="${ACCENT}" opacity="0.3"/>
    <rect x="200" y="450" width="100" height="6" rx="3" fill="${ACCENT}" opacity="0.2"/>
    <rect x="180" y="580" width="120" height="6" rx="3" fill="${ACCENT}" opacity="0.2"/>
    <rect x="200" y="610" width="100" height="6" rx="3" fill="${ACCENT}" opacity="0.3"/>

    <!-- "N" with more padding for safe zone -->
    <text x="512" y="560" font-family="Arial Black, Arial, Helvetica, sans-serif"
          font-size="440" font-weight="900" fill="url(#textGrad2)"
          text-anchor="middle" dominant-baseline="middle">N</text>

    <!-- Orange accent -->
    <rect x="320" y="720" width="384" height="14" rx="7" fill="url(#accent2)"/>

    <text x="680" y="680" font-family="Arial Black, Arial, Helvetica, sans-serif"
          font-size="140" font-weight="900" fill="url(#accent2)"
          text-anchor="middle" dominant-baseline="middle">R</text>
  </svg>`;

  await sharp(Buffer.from(adaptiveSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));

  console.log('✓ adaptive-icon.png (1024x1024)');
}

async function generateSplash() {
  const w = 1284;
  const h = 2778;

  const svg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="splashBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0F0F0F"/>
        <stop offset="100%" stop-color="#0A0A0A"/>
      </linearGradient>
      <linearGradient id="splashAccent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF8855"/>
        <stop offset="100%" stop-color="${ACCENT}"/>
      </linearGradient>
    </defs>

    <rect width="${w}" height="${h}" fill="url(#splashBg)"/>

    <!-- Centered logo -->
    <text x="${w / 2}" y="${h / 2 - 40}" font-family="Arial Black, Arial, Helvetica, sans-serif"
          font-size="160" font-weight="900" fill="${WHITE}"
          text-anchor="middle" dominant-baseline="middle"
          letter-spacing="-4">NumRush</text>

    <!-- Accent underline -->
    <rect x="${w / 2 - 160}" y="${h / 2 + 50}" width="320" height="8" rx="4" fill="url(#splashAccent)"/>

    <!-- Tagline -->
    <text x="${w / 2}" y="${h / 2 + 110}" font-family="Arial, Helvetica, sans-serif"
          font-size="36" font-weight="500" fill="#888888"
          text-anchor="middle" dominant-baseline="middle">Mental Math Trainer</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(1284, 2778)
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));

  console.log('✓ splash-icon.png (1284x2778)');
}

async function generateFavicon() {
  const size = 48;
  const svg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="8" fill="${BG}"/>
    <text x="24" y="34" font-family="Arial Black, Arial, sans-serif"
          font-size="32" font-weight="900" fill="${WHITE}"
          text-anchor="middle">N</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(48, 48)
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon.png'));

  console.log('✓ favicon.png (48x48)');
}

async function generateFeatureGraphic() {
  // Google Play feature graphic: 1024x500
  const w = 1024;
  const h = 500;

  const svg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fgBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#151515"/>
        <stop offset="100%" stop-color="#0A0A0A"/>
      </linearGradient>
      <linearGradient id="fgAccent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#FF8855"/>
        <stop offset="100%" stop-color="${ACCENT}"/>
      </linearGradient>
    </defs>

    <rect width="${w}" height="${h}" fill="url(#fgBg)"/>

    <!-- Math symbols floating in background -->
    <text x="80" y="120" font-family="Arial" font-size="64" fill="#1A1A1A" font-weight="700">+</text>
    <text x="900" y="100" font-family="Arial" font-size="48" fill="#1A1A1A" font-weight="700">×</text>
    <text x="150" y="420" font-family="Arial" font-size="56" fill="#1A1A1A" font-weight="700">÷</text>
    <text x="850" y="440" font-family="Arial" font-size="52" fill="#1A1A1A" font-weight="700">−</text>
    <text x="60" y="280" font-family="Arial" font-size="40" fill="#1A1A1A" font-weight="700">=</text>
    <text x="940" y="260" font-family="Arial" font-size="44" fill="#1A1A1A" font-weight="700">+</text>

    <!-- App name -->
    <text x="${w / 2}" y="220" font-family="Arial Black, Arial, Helvetica, sans-serif"
          font-size="120" font-weight="900" fill="${WHITE}"
          text-anchor="middle" dominant-baseline="middle"
          letter-spacing="-3">NumRush</text>

    <!-- Accent line -->
    <rect x="${w / 2 - 120}" y="270" width="240" height="6" rx="3" fill="url(#fgAccent)"/>

    <!-- Tagline -->
    <text x="${w / 2}" y="340" font-family="Arial, Helvetica, sans-serif"
          font-size="32" font-weight="500" fill="#888888"
          text-anchor="middle">Train Your Brain. Beat Your Score.</text>

    <!-- Price badge -->
    <rect x="${w / 2 - 50}" y="380" width="100" height="40" rx="20" fill="url(#fgAccent)"/>
    <text x="${w / 2}" y="405" font-family="Arial, Helvetica, sans-serif"
          font-size="20" font-weight="700" fill="${WHITE}"
          text-anchor="middle">$1.99</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(1024, 500)
    .png()
    .toFile(path.join(ASSETS_DIR, 'feature-graphic.png'));

  console.log('✓ feature-graphic.png (1024x500)');
}

async function main() {
  console.log('Generating NumRush assets...\n');
  await generateIcon();
  await generateSplash();
  await generateFavicon();
  await generateFeatureGraphic();
  console.log('\nDone! All assets in /assets/');
}

main().catch(console.error);
