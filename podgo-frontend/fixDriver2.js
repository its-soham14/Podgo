import fs from 'fs';
let content = fs.readFileSync('src/pages/DriverSetupPage.jsx', 'utf8');

const useEffectRegex = /useEffect\(\(\) => \{\s*return \(\) => \{\s*stopCamera\(\); \/\/ Cleanup on unmount\s*\};\s*\}, \[stream\]\);/;

const newUseEffect = `useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      stopCamera();
    };
  }, [stream]);`;

content = content.replace(useEffectRegex, newUseEffect);
fs.writeFileSync('src/pages/DriverSetupPage.jsx', content);
