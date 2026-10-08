const fs = require('fs');
const path = require('path');

// 1. Update HomePage.css
const cssPath = path.join('src', 'pages', 'HomePage.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace .pg-btn block
css = css.replace(/\.pg-btn\{[^}]+\}/, `.pg-btn {
  width:100%;
  border:0;
  border-radius:12px;
  padding:14px 20px;
  font-size:15px;
  font-weight:600;
  opacity:0;
  transform:translate3d(0,14px,0);
  will-change:opacity,transform;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
  min-height: 48px;
  min-width: 120px;
}`);

css = css.replace(/\.pg-btn-primary:hover\{[^}]+\}/, `.pg-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}`);

css = css.replace(/\.pg-btn-primary:active\{[^}]+\}/, `.pg-btn-primary:active {
  transform: translateY(0px) scale(0.97);
  opacity: 0.9;
}`);

css = css.replace(/\.pg-btn-secondary:hover\{[^}]+\}/, `.pg-btn-secondary:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}`);

css = css.replace(/\.pg-btn-secondary:active\{[^}]+\}/, `.pg-btn-secondary:active {
  transform: scale(0.97);
  opacity: 0.8;
}`);

css = css.replace(/\.pg-btn:focus-visible\{[^}]+\}/, `.pg-btn:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 3px;
}`);

// Add missing CSS
if (!css.includes('.pg-skeleton')) {
  css += `\n
.pg-skeleton {
  position: fixed;
  inset: 0;
  background: #0a0a0f;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
}

.pg-scroll-hint {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  animation: pgScrollBounce 2s ease-in-out infinite;
}

.pg-scroll-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  display: block;
}

@keyframes pgScrollBounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(6px); opacity: 0.9; }
}
`;
}

fs.writeFileSync(cssPath, css);


// 2. Update HomePage.jsx
const jsxPath = path.join('src', 'pages', 'HomePage.jsx');
let jsx = fs.readFileSync(jsxPath, 'utf8');

// Fix 1: overwrite: true on tweens
jsx = jsx.replace(/tl\.to\((el\.(car|pin|p1|p2|p3|sheen|wordImage|tagline|pathDot)),\s*\{([^}]+)\}/g, (match, el, name, props) => {
    if (!props.includes('overwrite')) {
        return `tl.to(${el}, { ${props}, overwrite: true }`;
    }
    return match;
});

// Fix 2: clipPath replacement
jsx = jsx.replace(/clipPath: "inset\([^)]+\)"/g, ''); // remove all clipPath
jsx = jsx.replace(/gsap\.set\(el\.wordImage, \{ opacity: 0, y: 9, scale: 0\.994,?( clipPath: "[^"]+")? \}\);/g, 'gsap.set(el.wordImage, { opacity: 0, xPercent: -100 });');
jsx = jsx.replace(/tl\.to\(el\.wordImage, \{ opacity: 1, y: 0, scale: 1,?( clipPath: "[^"]+",?)? /g, 'tl.to(el.wordImage, { opacity: 1, xPercent: 0, scale: 1, ');
jsx = jsx.replace(/gsap\.set\(el\.wordImage, \{ opacity: 1, y: 0, scale: 1,?( clipPath: "[^"]+",?)? \}\);/g, 'gsap.set(el.wordImage, { opacity: 1, xPercent: 0, scale: 1 });');
// add overflow hidden to frame
jsx = jsx.replace(/<div className="pg-wordmark-frame" id="pg-wordmark-frame">/g, '<div className="pg-wordmark-frame overflow-hidden" id="pg-wordmark-frame">');

// Fix 3: MotionPath replaced with keyframes
jsx = jsx.replace(/import \{ MotionPathPlugin \} from 'gsap\/MotionPathPlugin';\n/g, '');
jsx = jsx.replace(/gsap\.registerPlugin\(MotionPathPlugin\);\n/g, '');
jsx = jsx.replace(/tl\.set\(el\.pathDot, \{ opacity: 1 \}, T\.pathStart\)\s*\.to\(el\.pathDot, \{\s*motionPath: [^}]+\},\s*[^\}]+\},\s*T\.pathStart\)\s*\.to\(el\.pathDot, \{ opacity: 0, duration: 0\.10, ease: Ease\.soft, overwrite: true \}, T\.pathStart \+ T\.pathDuration - 0\.10\);/g, 
`tl.set(el.pathDot, { opacity: 1, x: 0, y: 0 }, T.pathStart)
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
        .to(el.pathDot, { opacity: 0, duration: 0.10, ease: Ease.soft, overwrite: true }, T.pathStart + T.pathDuration - 0.10);`);

// Fix 4: Resize observer for riseOffset
if (!jsx.includes('handleResize')) {
  jsx = jsx.replace(/init\(\);\n  \}, \[navigate\]\);/g, 
`init();

    const handleResize = () => {
      const offset = riseOffset();
      const logoEl = document.getElementById("pg-logo-wrap");
      if (logoEl && logoEl.style.transform.includes('scale(0.6)')) {
        gsap.set(logoEl, { y: offset });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);`);
}

// Fix 5: Skeleton JSX and logic
if (!jsx.includes('id="pg-loading-skeleton"')) {
    jsx = jsx.replace(/<div id="pg-app">/g, `<div id="pg-app">\n<div id="pg-loading-skeleton" className="pg-skeleton" aria-hidden="true"></div>`);
}
jsx = jsx.replace(/async function init\(\) \{\n\s*await waitForVisualAssets\(\);/g, 
`async function init() {
      const skeletonEl = document.getElementById("pg-loading-skeleton");
      if (skeletonEl) skeletonEl.style.opacity = "1";
      
      await waitForVisualAssets();
      
      if (skeletonEl) {
        gsap.to(skeletonEl, { opacity: 0, duration: 0.2, onComplete: () => {
          skeletonEl.style.display = 'none';
        }});
      }`);

// Fix 7: forceFullIntroEveryTime
jsx = jsx.replace(/forceFullIntroEveryTime: true/g, `forceFullIntroEveryTime: import.meta.env.DEV === true`);

// Fix 8: Scroll hint
if (!jsx.includes('pg-scroll-hint')) {
    jsx = jsx.replace(/<button className="pg-btn pg-btn-secondary" id="auth-signup" type="button" onClick=\{\(\) => navigate\('\/register'\)\}>Sign Up<\/button>\n\s*<\/div>/g, 
    `<button className="pg-btn pg-btn-secondary" id="auth-signup" type="button" onClick={() => navigate('/register')}>Sign Up</button>\n    </div>\n    <div className="pg-scroll-hint" aria-hidden="true">\n      <span className="pg-scroll-dot"></span>\n    </div>`);
}

// Fix 9: GPU acceleration
jsx = jsx.replace(/function reset\(\) \{/g, `function reset() {\n      [el.logo, el.ring, el.car, el.pin, el.wordImage, el.tagline, el.glow].forEach(elem => {\n        if (elem) gsap.set(elem, { willChange: "transform, opacity" });\n      });`);
jsx = jsx.replace(/if\(el\.intro\) el\.intro\.style\.pointerEvents = "none";/g, `if(el.intro) el.intro.style.pointerEvents = "none";\n          [el.logo, el.ring, el.car, el.pin, el.wordImage, el.tagline, el.glow].forEach(elem => {\n            if (elem) gsap.set(elem, { willChange: "auto" });\n          });`);

fs.writeFileSync(jsxPath, jsx);
console.log('Update script completed.');
