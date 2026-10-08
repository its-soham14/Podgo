const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/ModeToggle.jsx', 'utf8');
content = content.replace(/className=\{\\/g, 'className={\').replace(/\\}/g, '\}');
fs.writeFileSync('src/components/dashboard/ModeToggle.jsx', content);

content = fs.readFileSync('src/components/dashboard/RiderDashboard.jsx', 'utf8');
content = content.replace(/\\\$/g, '$');
content = content.replace(/\\\/g, '\');
content = content.replace(/className=\{\\/g, 'className={\');
content = content.replace(/\\\}/g, '\}');
content = content.replace(/\\\/bookings\\\//g, '\/bookings/\/status\'); 
fs.writeFileSync('src/components/dashboard/RiderDashboard.jsx', content);

content = fs.readFileSync('src/components/common/Navbar.jsx', 'utf8');
content = content.replace(/className=\{\\/g, 'className={\').replace(/\\\}/g, '\}').replace(/\\\$/g, '$');
fs.writeFileSync('src/components/common/Navbar.jsx', content);
