const fs = require('fs');

let jsx = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');

const oldStr = `      tl.set(el.pathDot, { opacity: 1 }, T.pathStart)
        .to(el.pathDot, {
          motionPath: { path: el.motionPath, align: el.motionPath, autoRotate: false, alignOrigin: [0.5, 0.5] },
          duration: T.pathDuration, ease: "none"
        }, T.pathStart)
        .to(el.pathDot, { opacity: 0, duration: 0.10, ease: Ease.soft }, T.pathStart + T.pathDuration - 0.10);`;

const newStr = `      tl.set(el.pathDot, { opacity: 1, x: 0, y: 0 }, T.pathStart)
        .to(el.pathDot, {
          keyframes: [
            { x: 0, y: 0 },
            { x: -12, y: -60 },
            { x: 8, y: -120 },
            { x: 0, y: -217 }
          ],
          duration: T.pathDuration,
          ease: "none",
          overwrite: true
        }, T.pathStart)
        .to(el.pathDot, { opacity: 0, duration: 0.10, ease: Ease.soft, overwrite: true }, T.pathStart + T.pathDuration - 0.10);`;

jsx = jsx.replace(oldStr, newStr);

// Let's also check if motionpath imports were removed:
jsx = jsx.replace(/import \{ MotionPathPlugin \} from 'gsap\/MotionPathPlugin';\n/g, '');
jsx = jsx.replace(/gsap\.registerPlugin\(MotionPathPlugin\);\n/g, '');


fs.writeFileSync('src/pages/HomePage.jsx', jsx);
console.log('Fixed pathDot');
