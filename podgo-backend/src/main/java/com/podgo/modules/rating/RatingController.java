package com.podgo.modules.rating;

import com.podgo.modules.rating.dto.RatingRequestDto;
import com.podgo.modules.rating.dto.RatingResponseDto;
import com.podgo.utils.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RatingResponseDto>> submitRating(
            @Valid @RequestBody RatingRequestDto request,
            Authentication authentication) {
        RatingResponseDto response = ratingService.submitRating(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rating submitted successfully", response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<RatingResponseDto>>> getUserRatings(
            @PathVariable Long userId) {
        List<RatingResponseDto> ratings = ratingService.getUserRatings(userId);
        return ResponseEntity.ok(ApiResponse.success("Ratings fetched successfully", ratings));
    }
}
