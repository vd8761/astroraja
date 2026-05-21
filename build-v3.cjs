const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'archive', 'ask-astroraja-claude-source');
const destDir = path.join(__dirname, 'src', 'pages', 'v3');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy shared.css to public so it can be loaded
fs.copyFileSync(path.join(srcDir, 'shared.css'), path.join(__dirname, 'public', 'shared.css'));

fs.readdirSync(srcDir).forEach(file => {
  if (file.endsWith('.html')) {
    let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    
    // Fix links
    content = content.replace(/href="([^"]+)\.html([^"]*)"/g, 'href="/v3/$1$2"');
    content = content.replace(/href="shared\.css"/g, 'href="/shared.css"');
    content = content.replace(/href="index\.html"/g, 'href="/v3"'); // index.html to /v3
    
    // Fix image paths if necessary (they are unsplash links mostly)
    
    const astroPath = path.join(destDir, file.replace('.html', '.astro'));
    
    // Wrap in Astro frontmatter just in case we need it
    content = `---\n// Version 3 (Original Claude HTML)\n---\n` + content;
    
    fs.writeFileSync(astroPath, content);
  }
});
