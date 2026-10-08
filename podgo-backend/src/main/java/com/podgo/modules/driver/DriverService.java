package com.podgo.modules.driver;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.podgo.exception.BadRequestException;
import com.podgo.exception.ResourceNotFoundException;
import com.podgo.modules.driver.dto.DriverProfileRequest;
import com.podgo.modules.driver.dto.DriverVerificationStatusResponse;
import com.podgo.modules.driver.dto.UploadResponse;
import com.podgo.modules.user.User;
import com.podgo.modules.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class DriverService {

    private static final Logger log = LoggerFactory.getLogger(DriverService.class);

    @Value("${verification.dev-mode:false}")
    private boolean devMode;

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;
    private final VerificationService verificationService;

    public DriverService(DriverRepository driverRepository, UserRepository userRepository,
            Cloudinary cloudinary, VerificationService verificationService) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.cloudinary = cloudinary;
        this.verificationService = verificationService;
    }

    @Transactional
    public UploadResponse uploadDocs(MultipartFile profilePhoto, MultipartFile vehiclePhoto,
            MultipartFile idProof, MultipartFile rcFront,
            MultipartFile rcBack, MultipartFile drivingLicence,
            MultipartFile selfie, String email) {
        String profileUrl = null;
        String vehicleUrl = null;
        String idProofUrl = null;
        String rcFrontUrl = null;
        String rcBackUrl = null;
        String dlUrl = null;
        String selfieUrl = null;

        try {
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                profileUrl = uploadToCloudinary(profilePhoto);
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                user.setProfilePhotoUrl(profileUrl);
                userRepository.save(user);
            }
            if (vehiclePhoto != null && !vehiclePhoto.isEmpty())
                vehicleUrl = uploadToCloudinary(vehiclePhoto);
            if (idProof != null && !idProof.isEmpty())
                idProofUrl = uploadToCloudinary(idProof);
            if (rcFront != null && !rcFront.isEmpty())
                rcFrontUrl = uploadToCloudinary(rcFront);
            if (rcBack != null && !rcBack.isEmpty())
                rcBackUrl = uploadToCloudinary(rcBack);
            if (drivingLicence != null && !drivingLicence.isEmpty())
                dlUrl = uploadToCloudinary(drivingLicence);
            if (selfie != null && !selfie.isEmpty())
                selfieUrl = uploadToCloudinary(selfie);

        } catch (IOException e) {
            log.error("Failed to upload files to Cloudinary", e);
            throw new BadRequestException("Failed to upload files. Please try again.");
        }

        return new UploadResponse(profileUrl, vehicleUrl, idProofUrl, rcFrontUrl, rcBackUrl, dlUrl, selfieUrl);
    }

    @Transactional
    public void createOrUpdateDriverProfile(DriverProfileRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        DriverProfile profile = driverRepository.findByUser(user).orElse(new DriverProfile());

        profile.setUser(user);
        profile.setVehicleType(request.vehicleType());
        profile.setVehicleNumber(request.vehicleNumber());
        profile.setVehicleModel(request.vehicleModel());
        profile.setVehiclePhotoUrl(request.vehiclePhotoUrl());
        profile.setIdProofUrl(request.idProofUrl());
        profile.setRcFrontUrl(request.rcFrontUrl());
        profile.setRcBackUrl(request.rcBackUrl());
        profile.setDrivingLicenceUrl(request.drivingLicenceUrl());
        profile.setSelfieUrl(request.selfieUrl());

        profile.setVerificationStatus(DriverProfile.VerificationStatus.PENDING);
        profile.setVerificationNote(null);

        // Govt ID Check
        String idProofOcr = verificationService.verifyDocumentFromUrl(request.idProofUrl());
        boolean isGovtIdVerified = verificationService.verifyGovernmentId(idProofOcr);
        profile.setGovtIdVerified(isGovtIdVerified);

        // DL Check
        String dlOcr = verificationService.verifyDocumentFromUrl(request.drivingLicenceUrl());
        boolean isDlVerified = verificationService.verifyDrivingLicence(dlOcr);
        profile.setDlVerificationPassed(isDlVerified);

        // RC Check
        String rcOcr = verificationService.verifyDocumentFromUrl(request.rcFrontUrl());
        String extractedRegNum = verificationService.extractRegistrationNumber(rcOcr);
        profile.setRcExtractedRegNumber(extractedRegNum);

        boolean isRcVerified = validateRcRegistrationMatch(request.vehicleNumber(), extractedRegNum);
        profile.setRcVerificationPassed(isRcVerified);

        // Evaluate all
        if (!isGovtIdVerified) {
            profile.setVerificationStatus(DriverProfile.VerificationStatus.REJECTED);
            profile.setVerificationNote(
                    "Government ID verification failed. Please upload a clear valid Indian ID (Aadhaar/PAN).");
        } else if (!isDlVerified) {
            profile.setVerificationStatus(DriverProfile.VerificationStatus.REJECTED);
            profile.setVerificationNote("Driving licence not recognized. Please upload a clear valid driving licence.");
        } else if (!isRcVerified) {
            profile.setVerificationStatus(DriverProfile.VerificationStatus.REJECTED);
            profile.setVerificationNote("RC registration number mismatch: entered " + request.vehicleNumber()
                    + " but extracted " + (extractedRegNum != null ? extractedRegNum : "None"));
        } else {
            profile.setVerificationStatus(DriverProfile.VerificationStatus.VERIFIED);
            profile.setVerifiedAt(LocalDateTime.now());
            profile.setVerificationNote("All documents successfully verified by AI.");
            if (user.getRole() == User.Role.RIDER) {
                user.setRole(User.Role.BOTH);
                userRepository.save(user);
            }
        }

        driverRepository.save(profile);
    }

    public DriverVerificationStatusResponse getVerificationStatus(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return driverRepository.findByUser(user)
                .map(profile -> new DriverVerificationStatusResponse(profile.getVerificationStatus().name(),
                        profile.getVerificationNote()))
                .orElse(new DriverVerificationStatusResponse("NOT_STARTED", null));
    }

    private String uploadToCloudinary(MultipartFile file) throws IOException {
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.startsWith("image/") || contentType.equals("application/pdf"))) {
            throw new BadRequestException("Only image and PDF files are allowed");
        }
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }

    private boolean validateRcRegistrationMatch(String manuallyEntered, String extracted) {
        if (devMode) {
            log.info("DEV MODE: RC registration number match check skipped");
            return true;
        }
        if (extracted == null || manuallyEntered == null)
            return false;
        String clean1 = manuallyEntered.toUpperCase().replaceAll("[-\\s]", "");
        String clean2 = extracted.toUpperCase().replaceAll("[-\\s]", "");
        return clean1.equals(clean2);
    }
}
