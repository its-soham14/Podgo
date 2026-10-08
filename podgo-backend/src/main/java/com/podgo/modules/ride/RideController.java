package com.podgo.modules.ride;

import com.podgo.modules.ride.dto.RideRequestDto;
import com.podgo.modules.ride.dto.RideResponseDto;
import com.podgo.modules.ride.dto.RideSearchRequestDto;
import com.podgo.utils.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @PostMapping("/calculate-fare")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> calculateFare(@RequestBody java.util.Map<String, Object> request) {
        List<java.util.Map<String, Object>> waypoints = (List<java.util.Map<String, Object>>) request.get("waypoints");
        double totalDistance = 0.0;
        
        if (waypoints != null && waypoints.size() > 1) {
            for (int i = 0; i < waypoints.size() - 1; i++) {
                java.util.Map<String, Object> p1 = waypoints.get(i);
                java.util.Map<String, Object> p2 = waypoints.get(i+1);
                double lat1 = Double.parseDouble(p1.get("lat").toString());
                double lon1 = Double.parseDouble(p1.get("lng").toString());
                double lat2 = Double.parseDouble(p2.get("lat").toString());
                double lon2 = Double.parseDouble(p2.get("lng").toString());
                
                double earthRadius = 6371;
                double dLat = Math.toRadians(lat2 - lat1);
                double dLon = Math.toRadians(lon2 - lon1);
                double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                           Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                           Math.sin(dLon/2) * Math.sin(dLon/2);
                double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                totalDistance += earthRadius * c;
            }
        }
        
        // ₹4 per km, min ₹50
        double recommendedFare = Math.max(50.0, totalDistance * 4.0);
        
        java.util.Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("recommendedFare", recommendedFare);
        responseData.put("distanceKm", totalDistance);
        
        return ResponseEntity.ok(ApiResponse.success("Fare calculated", responseData));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RideResponseDto>> createRide(@Valid @RequestBody RideRequestDto request, Authentication authentication) {
        RideResponseDto response = rideService.createRide(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ride posted successfully", response));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<ApiResponse<RideResponseDto>> startRide(
            @PathVariable Long id, Authentication authentication) {
        RideResponseDto response = rideService.startRide(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Ride started successfully", response));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<RideResponseDto>> completeRide(
            @PathVariable Long id, Authentication authentication) {
        RideResponseDto response = rideService.completeRide(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Ride completed successfully", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<RideResponseDto>> cancelRide(
            @PathVariable Long id, Authentication authentication) {
        RideResponseDto response = rideService.cancelRide(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Ride cancelled successfully", response));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<RideResponseDto>>> searchRides(@RequestBody RideSearchRequestDto request) {
        List<RideResponseDto> rides = rideService.searchRides(request);
        return ResponseEntity.ok(ApiResponse.success("Rides fetched successfully", rides));
    }

    @GetMapping("/driver")
    public ResponseEntity<ApiResponse<List<RideResponseDto>>> getDriverRides(Authentication authentication) {
        List<RideResponseDto> rides = rideService.getDriverRides(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Driver rides fetched successfully", rides));
    }
    
    @GetMapping("/recommend-fare")
    public ResponseEntity<ApiResponse<BigDecimal>> getRecommendedFare(
            @RequestParam BigDecimal originLat, @RequestParam BigDecimal originLng,
            @RequestParam BigDecimal destLat, @RequestParam BigDecimal destLng) {
        BigDecimal fare = rideService.calculateRecommendedFare(originLat, originLng, destLat, destLng);
        return ResponseEntity.ok(ApiResponse.success("Fare calculated", fare));
    }
}
