const fs = require('fs');

const adminFiles = [
  'src/layouts/AdminLayout.astro',
  'src/pages/admin/index.astro',
  'src/pages/admin/report-preview/[id].astro',
  'src/pages/api/admin/create-affiliate.ts',
  'src/pages/api/admin/login.ts',
  'src/pages/api/admin/report-pdf.ts',
  'src/pages/api/admin/send-report-email.ts',
  'src/pages/api/admin/settle-commission.ts',
  'src/pages/api/admin/update-affiliate.ts'
];

adminFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /crypto\.createHash\('sha256'\)\.update\(adminPassword\)\.digest\('hex'\)/g,
      "crypto.scryptSync(adminPassword, 'admin_salt', 64).toString('hex')"
    );
    fs.writeFileSync(file, content);
    console.log('Updated admin auth hash in ' + file);
  }
});

const affiliateFiles = [
  'src/pages/api/admin/create-affiliate.ts',
  'src/pages/api/admin/update-affiliate.ts'
];

affiliateFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /crypto\.createHash\('sha256'\)\.update\(password\)\.digest\('hex'\)/g,
      "crypto.scryptSync(password, 'astroraja_salt', 64).toString('hex')"
    );
    fs.writeFileSync(file, content);
    console.log('Updated affiliate hash in ' + file);
  }
});
