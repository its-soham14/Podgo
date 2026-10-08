import fs from 'fs';
let content = fs.readFileSync('src/pages/FindRidePage.jsx', 'utf8');
content = content.replace('className="flex items-center gap-4 relative z-10 group"', 'className="flex items-center gap-4 relative z-20 group"');
fs.writeFileSync('src/pages/FindRidePage.jsx', content);
