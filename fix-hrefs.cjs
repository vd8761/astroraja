const fs = require('fs');
const path = require('path');

['v1', 'v2'].forEach(version => {
  const dir = path.join(__dirname, 'src/pages', version);
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.astro')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix href="/#form-section" to href="/v1/#form-section"
      content = content.replace(/href="\//g, `href="/${version}/`);
      
      fs.writeFileSync(filePath, content);
    }
  });
});
