package com.fitness.activityservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityStatsDTO {
    private Long totalWorkouts;
    private Integer totalCaloriesBurned;
    private Integer totalDurationMinutes;
    private Integer activeStreakDays;
    private Double averageCaloriesPerSession;
    private Long lastRefreshedTimestamp;
}
