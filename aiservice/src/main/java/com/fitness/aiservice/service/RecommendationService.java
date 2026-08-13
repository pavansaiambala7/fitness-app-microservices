package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;
    private final ActivityAIService activityAIService;

    public List<Recommendation> getUserRecommendation(String userId) {
        List<Recommendation> recommendations = recommendationRepository.findByUserId(userId);
        if (recommendations.isEmpty()) {
            Activity defaultActivity = Activity.builder()
                    .id("sample-act-" + System.currentTimeMillis())
                    .userId(userId)
                    .type("RUNNING")
                    .duration(30)
                    .caloriesBurned(320)
                    .build();
            Recommendation rec = activityAIService.generateRecommendation(defaultActivity);
            try {
                recommendationRepository.save(rec);
            } catch (Exception e) {
                log.warn("Repository save bypassed for dynamic recommendation: {}", e.getMessage());
            }
            return List.of(rec);
        }
        return recommendations;
    }

    public Recommendation getActivityRecommendation(String activityId) {
        return recommendationRepository.findByActivityId(activityId)
                .orElseGet(() -> {
                    Activity activity = Activity.builder()
                            .id(activityId)
                            .userId("user-101")
                            .type("CARDIO")
                            .duration(45)
                            .caloriesBurned(450)
                            .build();
                    return activityAIService.generateRecommendation(activity);
                });
    }
}

