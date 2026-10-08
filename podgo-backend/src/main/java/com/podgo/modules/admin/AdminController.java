package com.podgo.modules.admin;

import com.podgo.modules.admin.dto.AdminDriverProfileDto;
import com.podgo.modules.admin.dto.AdminRideDto;
import com.podgo.modules.admin.dto.AdminStatsDto;
import com.podgo.modules.admin.dto.AdminUserDto;
import com.podgo.utils.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", adminService.getAllUsers()));
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<ApiResponse<AdminUserDto>> toggleSuspendUser(@PathVariable Long id) {
        AdminUserDto dto = adminService.toggleSuspendUser(id);
        String action = dto.isActive() ? "unbanned" : "suspended";
        return ResponseEntity.ok(ApiResponse.success("User " + action + " successfully", dto));
    }

    @GetMapping("/drivers/pending")
    public ResponseEntity<ApiResponse<List<AdminDriverProfileDto>>> getPendingDrivers() {
        return ResponseEntity.ok(ApiResponse.success("Pending drivers fetched successfully", adminService.getPendingDrivers()));
    }

    @PutMapping("/drivers/{id}/verify")
    public ResponseEntity<ApiResponse<AdminDriverProfileDto>> verifyDriver(@PathVariable Long id, @RequestParam String action) {
        AdminDriverProfileDto dto = adminService.verifyDriver(id, action);
        return ResponseEntity.ok(ApiResponse.success("Driver verification updated successfully", dto));
    }

    @GetMapping("/rides")
    public ResponseEntity<ApiResponse<List<AdminRideDto>>> getAllRides() {
        return ResponseEntity.ok(ApiResponse.success("All rides fetched successfully", adminService.getAllRides()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", adminService.getStats()));
    }
}
