const fs = require('fs');
const path = require('path');

const homePagePath = path.join('src', 'pages', 'HomePage.jsx');
const assetsDir = path.join('public', 'assets');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

let content = fs.readFileSync(homePagePath, 'utf8');

// 1. Extract Base64 Images and replace
const extractAndReplace = (idRegex, filename, attrName) => {
    const regex = new RegExp(`(<(image|img)[^>]*id=["']${idRegex}["'][^>]*${attrName}=["'])data:image\\/webp;base64,([^"']+)["']`);
    const match = content.match(regex);
    if (match) {
        const base64Data = match[3];
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(path.join(assetsDir, filename), buffer);
        content = content.replace(regex, `$1/assets/${filename}"`);
        console.log(`Extracted and replaced ${idRegex} -> ${filename}`);
    } else {
        console.log(`Could not find ${idRegex}`);
    }
};

extractAndReplace('icon-full', 'pg-icon-full.webp', 'href');
extractAndReplace('car-layer', 'pg-car-layer.webp', 'href');
extractAndReplace('pin-layer', 'pg-pin-layer.webp', 'href');
extractAndReplace('passenger-1', 'pg-passenger-1.webp', 'href');
extractAndReplace('passenger-2', 'pg-passenger-2.webp', 'href');
extractAndReplace('passenger-3', 'pg-passenger-3.webp', 'href');
extractAndReplace('pg-wordmark-image', 'pg-wordmark.webp', 'src');

// 2. Remove script tags
content = content.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.15\.0\/gsap\.min\.js"><\/script>\s*/g, '');
content = content.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.15\.0\/MotionPathPlugin\.min\.js"><\/script>\s*/g, '');

// 3. Fix stop-color to stopColor
content = content.replace(/stop-color/g, 'stopColor');

// 4. Add navigate to dependency array
content = content.replace(/init\(\);\n  }, \[\]\);/g, 'init();\n  }, [navigate]);');

fs.writeFileSync(homePagePath, content);
console.log('HomePage.jsx updated successfully.');
