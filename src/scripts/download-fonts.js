import fs from 'fs';
import path from 'path';
import https from 'https';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

const fonts = [
  { name: 'NotoSans-Regular.ttf', url: 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf' },
  { name: 'NotoSans-Bold.ttf', url: 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf' },
  { name: 'NotoSansTamil-Regular.ttf', url: 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf' },
  { name: 'NotoSansTamil-Bold.ttf', url: 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansTamil/NotoSansTamil-Bold.ttf' }
];

async function downloadFont(font) {
  const dest = path.join(FONTS_DIR, font.name);
  console.log(`Downloading ${font.name}...`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(font.url, response => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, redirectResponse => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', err => {
          fs.unlinkSync(dest);
          reject(err);
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }
    }).on('error', err => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  for (const font of fonts) {
    await downloadFont(font);
  }
  console.log("All fonts downloaded successfully to public/fonts/");
}

main().catch(console.error);
