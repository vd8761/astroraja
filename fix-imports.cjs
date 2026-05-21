const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.astro'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace import Layout from '../../layouts/Layout.astro'
  // with import Layout from '../layouts/Layout.astro'
  if (content.includes('../../layouts/Layout.astro')) {
    content = content.replace(/import Layout from '\.\.\/\.\.\/layouts\/Layout\.astro'/g, "import Layout from '../layouts/Layout.astro'");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated layout import in ${file}`);
  }
}
