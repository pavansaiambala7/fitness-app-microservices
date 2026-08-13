package com.fitness.activityservice.controller;

import com.fitness.activityservice.dto.ActivityRequest;
import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.dto.ActivityStatsDTO;
import com.fitness.activityservice.service.ActivityService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@AllArgsConstructor
public class ActivityController {

    private ActivityService activityService;

    @PostMapping
    public ResponseEntity<ActivityResponse> trackActivity(
            @RequestBody ActivityRequest request,
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            request.setUserId(userId);
        }
        return ResponseEntity.ok(activityService.trackActivity(request));
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getActivities(
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            return ResponseEntity.ok(activityService.getUserActivities(userId));
        }
        return ResponseEntity.ok(activityService.getAllActivities());
    }

    @GetMapping("/stats")
    public ResponseEntity<ActivityStatsDTO> getLiveStats() {
        return ResponseEntity.ok(activityService.getLiveStats());
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> getActivity(@PathVariable String activityId) {
        return ResponseEntity.ok(activityService.getActivityById(activityId));
    }
}

