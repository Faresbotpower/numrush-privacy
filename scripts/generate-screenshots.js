const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '..', 'assets', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const BG = '#050505';
const SURFACE = '#151515';
const BORDER = '#2A2A2A';
const ACCENT = '#FF6B35';
const WHITE = '#FFFFFF';
const DIM = '#666666';
const CORRECT = '#34C759';
const STREAK = '#FFD60A';
const WRONG = '#FF3B30';

// iPhone 6.7" dimensions: 1290x2796
const W = 1290;
const H = 2796;

async function screenshot1_Home() {
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${BG}"/>

    <!-- Status bar area -->
    <rect x="0" y="0" width="${W}" height="120" fill="${BG}"/>

    <!-- Title -->
    <text x="${W/2}" y="320" font-family="Arial Black, sans-serif" font-size="96" font-weight="900" fill="${WHITE}" text-anchor="middle">NumRush</text>
    <rect x="${W/2 - 36}" y="345" width="72" height="6" rx="3" fill="${ACCENT}"/>
    <text x="${W/2}" y="410" font-family="Arial, sans-serif" font-size="28" font-weight="500" fill="${DIM}" text-anchor="middle" letter-spacing="4">MENTAL MATH TRAINER</text>

    <!-- Quick Stats Bar -->
    <rect x="60" y="500" width="${W-120}" height="160" rx="24" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="270" y="570" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="${WHITE}" text-anchor="middle">247</text>
    <text x="270" y="610" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="${DIM}" text-anchor="middle" letter-spacing="1">SOLVED</text>
    <line x1="430" y1="530" x2="430" y2="630" stroke="${BORDER}" stroke-width="2"/>
    <text x="${W/2}" y="570" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="${STREAK}" text-anchor="middle">18</text>
    <text x="${W/2}" y="610" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="${DIM}" text-anchor="middle" letter-spacing="1">BEST STREAK</text>
    <line x1="860" y1="530" x2="860" y2="630" stroke="${BORDER}" stroke-width="2"/>
    <text x="1020" y="570" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="${CORRECT}" text-anchor="middle">92%</text>
    <text x="1020" y="610" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="${DIM}" text-anchor="middle" letter-spacing="1">ACCURACY</text>

    <!-- Mode Cards -->
    <!-- Timed -->
    <rect x="60" y="740" width="${W-120}" height="140" rx="24" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <rect x="90" y="770" width="80" height="80" rx="16" fill="${ACCENT}18" stroke="${ACCENT}40" stroke-width="2"/>
    <text x="130" y="822" font-family="Arial, sans-serif" font-size="36" text-anchor="middle">\u23F1</text>
    <text x="210" y="810" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="${WHITE}">Timed</text>
    <text x="210" y="850" font-family="Arial, sans-serif" font-size="26" fill="${DIM}">60s blitz — how many can you solve?</text>
    <text x="${W-100}" y="825" font-family="Arial, sans-serif" font-size="44" fill="${ACCENT}" font-weight="300">\u203A</text>

    <!-- Streak -->
    <rect x="60" y="900" width="${W-120}" height="140" rx="24" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <rect x="90" y="930" width="80" height="80" rx="16" fill="${STREAK}18" stroke="${STREAK}40" stroke-width="2"/>
    <text x="130" y="982" font-family="Arial, sans-serif" font-size="36" text-anchor="middle">\uD83D\uDD25</text>
    <text x="210" y="970" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="${WHITE}">Streak</text>
    <text x="210" y="1010" font-family="Arial, sans-serif" font-size="26" fill="${DIM}">One wrong answer and it's over</text>
    <text x="${W-100}" y="985" font-family="Arial, sans-serif" font-size="44" fill="${STREAK}" font-weight="300">\u203A</text>

    <!-- Practice -->
    <rect x="60" y="1060" width="${W-120}" height="140" rx="24" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <rect x="90" y="1090" width="80" height="80" rx="16" fill="#007AFF18" stroke="#007AFF40" stroke-width="2"/>
    <text x="130" y="1142" font-family="Arial, sans-serif" font-size="36" text-anchor="middle">\uD83E\uDDE0</text>
    <text x="210" y="1130" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="${WHITE}">Practice</text>
    <text x="210" y="1170" font-family="Arial, sans-serif" font-size="26" fill="${DIM}">No pressure, just sharpen your skills</text>
    <text x="${W-100}" y="1145" font-family="Arial, sans-serif" font-size="44" fill="#007AFF" font-weight="300">\u203A</text>

    <!-- Promo text overlay at bottom -->
    <text x="${W/2}" y="1380" font-family="Arial Black, sans-serif" font-size="44" font-weight="900" fill="${WHITE}" text-anchor="middle">Choose Your Challenge</text>
    <text x="${W/2}" y="1430" font-family="Arial, sans-serif" font-size="28" fill="${DIM}" text-anchor="middle">Three modes to test your mental math</text>
  </svg>`;

  await sharp(Buffer.from(svg)).resize(1290, 2796).png().toFile(path.join(OUT, '01_home.png'));
  console.log('✓ 01_home.png');
}

async function screenshot2_Gameplay() {
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${BG}"/>

    <!-- Top bar -->
    <circle cx="100" cy="200" r="36" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="100" y="212" font-family="Arial, sans-serif" font-size="32" fill="#A0A0A0" text-anchor="middle">\u2190</text>

    <!-- Streak badge -->
    <rect x="${W/2 - 60}" y="172" width="120" height="56" rx="28" fill="${STREAK}18" stroke="${STREAK}40" stroke-width="2"/>
    <text x="${W/2 - 15}" y="210" font-family="Arial, sans-serif" font-size="28">\uD83D\uDD25</text>
    <text x="${W/2 + 25}" y="210" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="${STREAK}">7</text>

    <!-- Timer -->
    <rect x="${W - 200}" y="172" width="130" height="56" rx="28" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="${W - 155}" y="210" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="${WHITE}">42</text>
    <text x="${W - 110}" y="210" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="${DIM}">s</text>

    <!-- Info row -->
    <rect x="60" y="280" width="90" height="36" rx="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="1"/>
    <text x="105" y="304" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="${DIM}" text-anchor="middle" letter-spacing="1">EASY</text>
    <text x="${W - 100}" y="304" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="${DIM}" text-anchor="end" letter-spacing="1">93% ACCURACY</text>

    <!-- Problem -->
    <text x="${W/2}" y="620" font-family="Arial Black, sans-serif" font-size="140" font-weight="900" fill="${WHITE}" text-anchor="middle">8 \u00D7 7</text>
    <text x="${W/2}" y="720" font-family="Arial, sans-serif" font-size="52" font-weight="600" fill="${DIM}" text-anchor="middle">= ?</text>

    <!-- Answer input -->
    <rect x="${W/2 - 150}" y="800" width="300" height="110" rx="24" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="${W/2 - 20}" y="875" font-family="Arial Black, sans-serif" font-size="80" font-weight="800" fill="${WHITE}" text-anchor="middle">56</text>
    <rect x="${W/2 + 50}" y="835" width="4" height="50" rx="2" fill="${ACCENT}"/>

    <!-- Number pad -->
    ${[['1','2','3'],['4','5','6'],['7','8','9'],['\u232B','0','GO']].map((row, ri) =>
      row.map((key, ci) => {
        const x = 60 + ci * (390 + 15);
        const y = 1020 + ri * (130 + 12);
        const isGo = key === 'GO';
        const isDel = key === '\u232B';
        const bg = isGo ? ACCENT : isDel ? '#0E0E0E' : SURFACE;
        const border = isGo ? '#FF8F66' : BORDER;
        const textColor = isDel ? '#A0A0A0' : WHITE;
        return `
          <rect x="${x}" y="${y}" width="390" height="130" rx="18" fill="${bg}" stroke="${border}" stroke-width="2"/>
          <text x="${x + 195}" y="${y + 80}" font-family="Arial, sans-serif" font-size="${isGo ? '32' : isDel ? '44' : '40'}" font-weight="${isGo ? '800' : '600'}" fill="${textColor}" text-anchor="middle"${isGo ? ' letter-spacing="2"' : ''}>${key}</text>
        `;
      }).join('')
    ).join('')}

    <!-- Promo text -->
    <text x="${W/2}" y="1660" font-family="Arial Black, sans-serif" font-size="44" font-weight="900" fill="${WHITE}" text-anchor="middle">Fast, Focused Gameplay</text>
    <text x="${W/2}" y="1710" font-family="Arial, sans-serif" font-size="28" fill="${DIM}" text-anchor="middle">Solve problems with instant feedback</text>
  </svg>`;

  await sharp(Buffer.from(svg)).resize(1290, 2796).png().toFile(path.join(OUT, '02_gameplay.png'));
  console.log('✓ 02_gameplay.png');
}

async function screenshot3_Results() {
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${BG}"/>

    <!-- Title -->
    <text x="${W/2}" y="360" font-family="Arial Black, sans-serif" font-size="72" font-weight="900" fill="${WHITE}" text-anchor="middle">Time's Up!</text>
    <rect x="${W/2 - 30}" y="385" width="60" height="5" rx="2.5" fill="${ACCENT}"/>

    <!-- Score -->
    <text x="${W/2}" y="480" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="${DIM}" text-anchor="middle" letter-spacing="3">SCORE</text>
    <text x="${W/2}" y="620" font-family="Arial Black, sans-serif" font-size="160" font-weight="900" fill="${ACCENT}" text-anchor="middle">23</text>

    <!-- Stats grid -->
    <rect x="60" y="720" width="${W/2 - 75}" height="140" rx="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="${60 + (W/2 - 75)/2}" y="790" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="${CORRECT}" text-anchor="middle">21</text>
    <text x="${60 + (W/2 - 75)/2}" y="830" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="${DIM}" text-anchor="middle" letter-spacing="1">CORRECT</text>

    <rect x="${W/2 + 15}" y="720" width="${W/2 - 75}" height="140" rx="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="${W/2 + 15 + (W/2 - 75)/2}" y="790" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="${WRONG}" text-anchor="middle">2</text>
    <text x="${W/2 + 15 + (W/2 - 75)/2}" y="830" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="${DIM}" text-anchor="middle" letter-spacing="1">WRONG</text>

    <rect x="60" y="876" width="${W/2 - 75}" height="140" rx="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="${60 + (W/2 - 75)/2}" y="946" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="${CORRECT}" text-anchor="middle">91%</text>
    <text x="${60 + (W/2 - 75)/2}" y="986" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="${DIM}" text-anchor="middle" letter-spacing="1">ACCURACY</text>

    <rect x="${W/2 + 15}" y="876" width="${W/2 - 75}" height="140" rx="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="${W/2 + 15 + (W/2 - 75)/2}" y="946" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="${STREAK}" text-anchor="middle">12</text>
    <text x="${W/2 + 15 + (W/2 - 75)/2}" y="986" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="${DIM}" text-anchor="middle" letter-spacing="1">BEST STREAK</text>

    <!-- Buttons -->
    <rect x="60" y="1100" width="${W-120}" height="86" rx="18" fill="${ACCENT}"/>
    <text x="${W/2}" y="1155" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="${WHITE}" text-anchor="middle">Play Again</text>

    <rect x="60" y="1204" width="${W-120}" height="86" rx="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="${W/2}" y="1259" font-family="Arial, sans-serif" font-size="32" font-weight="600" fill="#A0A0A0" text-anchor="middle">Home</text>

    <!-- Promo -->
    <text x="${W/2}" y="1430" font-family="Arial Black, sans-serif" font-size="44" font-weight="900" fill="${WHITE}" text-anchor="middle">Track Your Progress</text>
    <text x="${W/2}" y="1480" font-family="Arial, sans-serif" font-size="28" fill="${DIM}" text-anchor="middle">Detailed stats after every game</text>
  </svg>`;

  await sharp(Buffer.from(svg)).resize(1290, 2796).png().toFile(path.join(OUT, '03_results.png'));
  console.log('✓ 03_results.png');
}

async function screenshot4_Settings() {
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${BG}"/>

    <!-- Header -->
    <circle cx="100" cy="200" r="36" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="100" y="212" font-family="Arial, sans-serif" font-size="32" fill="#A0A0A0" text-anchor="middle">\u2190</text>
    <text x="${W/2}" y="212" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="${WHITE}" text-anchor="middle">Settings</text>

    <!-- Difficulty section -->
    <text x="60" y="340" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="${DIM}" letter-spacing="2">DIFFICULTY</text>

    <!-- Easy (selected) -->
    <rect x="60" y="370" width="${W-120}" height="100" rx="18" fill="${ACCENT}20" stroke="${ACCENT}" stroke-width="2"/>
    <text x="100" y="425" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="${WHITE}">Easy</text>
    <text x="100" y="455" font-family="Arial, sans-serif" font-size="22" fill="${DIM}">Single digits (1-12)</text>
    <circle cx="${W - 110}" cy="420" r="18" fill="${ACCENT}"/>
    <text x="${W - 110}" y="428" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="${WHITE}" text-anchor="middle">\u2713</text>

    <!-- Medium -->
    <rect x="60" y="486" width="${W-120}" height="100" rx="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="100" y="541" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#A0A0A0">Medium</text>
    <text x="100" y="571" font-family="Arial, sans-serif" font-size="22" fill="${DIM}">Double digits (10-99)</text>

    <!-- Hard -->
    <rect x="60" y="602" width="${W-120}" height="100" rx="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="2"/>
    <text x="100" y="657" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#A0A0A0">Hard</text>
    <text x="100" y="687" font-family="Arial, sans-serif" font-size="22" fill="${DIM}">Triple digits (100-999)</text>

    <!-- Operations -->
    <text x="60" y="790" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="${DIM}" letter-spacing="2">OPERATIONS</text>

    ${[
      ['+', 'Addition', true], ['\u2212', 'Subtraction', true],
      ['\u00D7', 'Multiplication', true], ['\u00F7', 'Division', false]
    ].map(([sym, label, active], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 60 + col * ((W - 120) / 2 + 12);
      const y = 820 + row * 152;
      const w2 = (W - 120 - 12) / 2;
      const bg = active ? `${ACCENT}20` : SURFACE;
      const border = active ? ACCENT : BORDER;
      const symColor = active ? ACCENT : DIM;
      return `
        <rect x="${x}" y="${y}" width="${w2}" height="140" rx="18" fill="${bg}" stroke="${border}" stroke-width="2"/>
        <text x="${x + w2/2}" y="${y + 70}" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="${symColor}" text-anchor="middle">${sym}</text>
        <text x="${x + w2/2}" y="${y + 110}" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="${active ? '#A0A0A0' : DIM}" text-anchor="middle" letter-spacing="1">${label.toUpperCase()}</text>
      `;
    }).join('')}

    <!-- Promo -->
    <text x="${W/2}" y="1380" font-family="Arial Black, sans-serif" font-size="44" font-weight="900" fill="${WHITE}" text-anchor="middle">Customize Everything</text>
    <text x="${W/2}" y="1430" font-family="Arial, sans-serif" font-size="28" fill="${DIM}" text-anchor="middle">Difficulty, operations, timer, and more</text>
  </svg>`;

  await sharp(Buffer.from(svg)).resize(1290, 2796).png().toFile(path.join(OUT, '04_settings.png'));
  console.log('✓ 04_settings.png');
}

async function main() {
  console.log('Generating store screenshots...\n');
  await screenshot1_Home();
  await screenshot2_Gameplay();
  await screenshot3_Results();
  await screenshot4_Settings();
  console.log('\nDone! Screenshots in assets/screenshots/');
}

main().catch(console.error);
