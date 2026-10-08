const fs = require('fs');
const path = require('path');

const filePath = 'src/pages/HomePage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const base64Regex = /href="data:image\/webp;base64,([^"]+)"/g;
const srcRegex = /src="data:image\/webp;base64,([^"]+)"/g;

const assetsDir = 'public/assets';
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

let match;
const imageNames = [
  'pg-icon-full.webp',
  'pg-car-layer.webp',
  'pg-pin-layer.webp',
  'pg-passenger-1.webp',
  'pg-passenger-2.webp',
  'pg-passenger-3.webp'
];
let imgIndex = 0;

// Handle href base64 images
content = content.replace(base64Regex, (fullMatch, base64Data) => {
  if (imgIndex < imageNames.length) {
    const filename = imageNames[imgIndex++];
    const buf = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(path.join(assetsDir, filename), buf);
    return `href="/assets/${filename}"`;
  }
  return fullMatch;
});

// Handle src base64 image (wordmark)
content = content.replace(srcRegex, (fullMatch, base64Data) => {
  const filename = 'pg-wordmark.webp';
  const buf = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(path.join(assetsDir, filename), buf);
  return `src="/assets/${filename}"`;
});

// Remove script tags
content = content.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.15\.0\/gsap\.min\.js"><\/script>/, '');
content = content.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.15\.0\/MotionPathPlugin\.min\.js"><\/script>/, '');

// Replace stop-color with stopColor
content = content.replace(/stop-color=/g, 'stopColor=');

// Fix useEffect navigate dependency (we can do it via string replacement or just wait)
// Actually we'll replace `  }, []);` with `  }, [navigate]);`
content = content.replace(/  \}, \[\]\);/g, '  }, [navigate]);');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixes 1, 2, 3, 4 applied');
