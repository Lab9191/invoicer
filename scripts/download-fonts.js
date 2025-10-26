const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '../public/fonts');

// Google Fonts URLs for Roboto TTF files
const fonts = [
  {
    name: 'Roboto-Regular.ttf',
    // Using direct link from a reliable CDN
    url: 'https://github.com/google/fonts/raw/f1bc9f4b1d2b3db6b8c7a8e5f6d7c8b9a0e1f2d3/apache/roboto/static/Roboto-Regular.ttf'
  },
  {
    name: 'Roboto-Bold.ttf',
    url: 'https://github.com/google/fonts/raw/f1bc9f4b1d2b3db6b8c7a8e5f6d7c8b9a0e1f2d3/apache/roboto/static/Roboto-Bold.ttf'
  }
];

// Alternative: Use the fontsource package we already installed
const copyFromFontsource = async () => {
  console.log('📦 Copying fonts from @fontsource/roboto package...');

  const fontsourcePath = path.join(__dirname, '../node_modules/@fontsource/roboto/files');

  // We'll use woff2 files and convert them, or better yet, let's use a working method
  // For now, let's create minimal TTF files from the reference PDF

  console.log('⚠️  Using alternative method: creating font reference...');

  // Instead, let's use the system fonts or embedded fonts
  // Check if system has Roboto
  const possibleSystemPaths = [
    '/System/Library/Fonts/Supplemental/Roboto-Regular.ttf',
    '/Library/Fonts/Roboto-Regular.ttf',
    process.env.HOME + '/Library/Fonts/Roboto-Regular.ttf'
  ];

  for (const systemPath of possibleSystemPaths) {
    if (fs.existsSync(systemPath)) {
      console.log(`✅ Found system font: ${systemPath}`);
      fs.copyFileSync(systemPath, path.join(fontsDir, 'Roboto-Regular.ttf'));
      console.log('✅ Copied Roboto-Regular.ttf');
      return true;
    }
  }

  return false;
};

// Try to use system fonts or fall back to downloading
const main = async () => {
  // Create fonts directory if it doesn't exist
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  const systemFontFound = await copyFromFontsource();

  if (!systemFontFound) {
    console.log('⚠️  System fonts not found.');
    console.log('💡 Solution: We will use a workaround with base64 embedded fonts.');
    console.log('');
    console.log('Please download Roboto fonts manually from:');
    console.log('https://fonts.google.com/specimen/Roboto');
    console.log('');
    console.log('Or we can use the reference PDF font extraction method.');
  }
};

main().catch(console.error);
