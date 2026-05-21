const fs = require('fs');
const path = require('path');

['v1', 'v2'].forEach(version => {
  const dir = path.join(__dirname, 'src/pages', version);
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.astro')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace("from '../layouts/Layout.astro'", "from '../../layouts/Layout.astro'");
      content = content.replace(/<Layout /g, `<Layout basePath="/${version}" `);
      fs.writeFileSync(filePath, content);
    }
  });
});
