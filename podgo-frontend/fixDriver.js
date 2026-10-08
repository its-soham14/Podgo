import fs from 'fs';
let content = fs.readFileSync('src/pages/DriverSetupPage.jsx', 'utf8');

// 1. Fix startCamera useEffect
if (!content.includes('videoRef.current.srcObject = stream;')) {
  const useEffectStr = `
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);
`;
  const newUseEffectStr = `
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      stopCamera();
    };
  }, [stream]);
`;
  content = content.replace(useEffectStr, newUseEffectStr);
}

// 2. Fix api endpoints
content = content.replace("await api.post('/driver-profiles', formData);", "await api.post('/drivers/profile', formData);");
content = content.replace("await api.post('/driver-profiles/documents', docFormData,", "await api.post('/drivers/upload-docs', docFormData,");

// 3. Fix docFormData appending
const oldAppend = `        Object.keys(files).forEach(key => {
          if (files[key]) {
            docFormData.append(key, files[key]);
          }
        });`;
const newAppend = `        const fileMap = {
          rcFront: 'rc_front',
          rcBack: 'rc_back',
          drivingLicence: 'driving_licence',
          idProof: 'id_proof',
          vehiclePhoto: 'vehicle_photo',
          selfie: 'selfie',
        };
        Object.keys(files).forEach(key => {
          if (files[key]) {
            docFormData.append(fileMap[key], files[key]);
            if (key === 'selfie') {
              docFormData.append('profile_photo', files[key]);
            }
          }
        });`;
content = content.replace(oldAppend, newAppend);

// 4. Add capture="environment" to document uploads
content = content.replace('accept="image/*"\n                          className="absolute inset-0 opacity-0 cursor-pointer"', 'accept="image/*"\n                          capture="environment"\n                          className="absolute inset-0 opacity-0 cursor-pointer"');

fs.writeFileSync('src/pages/DriverSetupPage.jsx', content);
