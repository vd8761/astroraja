const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.astro'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace base path in layout
  content = content.replace(/basePath="\/v2"/g, 'basePath=""');
  
  // Replace internal links like href="/v2/about" to href="/about"
  content = content.replace(/href="\/v2\//g, 'href="/');
  
  // Replace window.location.href = '/v2/sample-report'
  content = content.replace(/'\/v2\//g, "'/");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated paths in ${file}`);
}
