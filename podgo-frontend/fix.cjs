const fs = require('fs');
let s = fs.readFileSync('src/pages/ForgotPasswordPage.jsx', 'utf8');
s = s.replace(/const neuExtruded = \$\{bgBase\}([^;]+);/g, 'const neuExtruded = `${bgBase}$1`;');
s = s.replace(/const neuRecessed = \$\{bgBase\}([^;]+);/g, 'const neuRecessed = `${bgBase}$1`;');
fs.writeFileSync('src/pages/ForgotPasswordPage.jsx', s, 'utf8');
