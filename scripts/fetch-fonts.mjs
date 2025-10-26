import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.join(__dirname, '../public/fonts');

// Create directory if it doesn't exist
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Direct raw GitHub content URLs that should work
const fonts = {
  'Roboto-Regular.ttf': 'https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Regular.ttf',
  'Roboto-Bold.ttf': 'https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Bold.ttf'
};

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`Following redirect to: ${response.headers.location}`);
        downloadFile(response.headers.location, destination).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('📥 Downloading Roboto fonts...\n');

  for (const [filename, url] of Object.entries(fonts)) {
    const destination = path.join(fontsDir, filename);
    console.log(`Downloading ${filename}...`);

    try {
      await downloadFile(url, destination);

      // Verify it's actually a TTF file
      const buffer = fs.readFileSync(destination);
      const header = buffer.toString('ascii', 0, 4);

      if (header.includes('<!DOCTYPE') || header.includes('<html')) {
        console.log(`❌ ${filename} - Downloaded HTML instead of font file`);
        fs.unlinkSync(destination);
      } else if (buffer[0] === 0x00 && buffer[1] === 0x01 && buffer[2] === 0x00 && buffer[3] === 0x00) {
        console.log(`✅ ${filename} - Valid TrueType font (${(buffer.length / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`✅ ${filename} - Downloaded (${(buffer.length / 1024).toFixed(2)} KB) - verifying...`);
      }
    } catch (error) {
      console.log(`❌ ${filename} - ${error.message}`);
    }
  }

  console.log('\n✅ Font download process completed!');
}

main().catch(console.error);
