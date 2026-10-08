import fs from 'fs';
let content = fs.readFileSync('src/pages/DriverSetupPage.jsx', 'utf8');
content = content.replace(/type="file"\s+accept="image\/\*"/, 'type="file"\n                        accept="image/*"\n                        capture="environment"');
fs.writeFileSync('src/pages/DriverSetupPage.jsx', content);
