#!/usr/bin/env node
// Run: node generate-icons.js
// Generates simple Q icons for the PWA. Replace with your actual logo if you have one.
const fs = require('fs');
const path = require('path');

function svgIcon(size) {
  const r = Math.round(size * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#0f0e0d"/>
  <rect x="${size*0.08}" y="${size*0.08}" width="${size*0.84}" height="${size*0.84}" rx="${r-4}" fill="#c84b2f"/>
  <text x="${size/2}" y="${size*0.68}" font-family="Georgia,serif" font-size="${size*0.55}" font-weight="bold"
    fill="white" text-anchor="middle">Q</text>
</svg>`;
}

const dir = path.join(__dirname, 'public/icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, 'icon-192.svg'), svgIcon(192));
fs.writeFileSync(path.join(dir, 'icon-512.svg'), svgIcon(512));

// Also write PNG placeholders that are valid 1x1 PNGs (browsers accept SVG via manifest too)
// For proper PNGs, replace these with actual PNG files
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuf = Buffer.from(pngBase64, 'base64');
fs.writeFileSync(path.join(dir, 'icon-192.png'), pngBuf);
fs.writeFileSync(path.join(dir, 'icon-512.png'), pngBuf);

console.log('Icons written to public/icons/');
console.log('TIP: Replace icon-192.png and icon-512.png with your actual Qopikun logo for best results.');
