package com.fitness.aiservice.service;

import com.fitness.aiservice.agent.FitnessCoachAgent;
import com.fitness.aiservice.dto.FitnessAnalysisDTO;
import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityAIService {

    private final FitnessCoachAgent fitnessCoachAgent;
    private final FitnessKnowledgeBaseService knowledgeBaseService;

    public Recommendation generateRecommendation(Activity activity) {
        log.info("Starting LangChain4j RAG AI Recommendation flow for activity ID: {}", activity.getId());

        // 1. Retrieve sports science context via Vector Search (RAG)
        String query = String.format("%s training duration %d mins calories %d",
                activity.getType(), activity.getDuration(), activity.getCaloriesBurned());
        String ragContext = knowledgeBaseService.retrieveRelevantContext(query);
        log.info("RAG Context Retrieved from Vector Store:\n{}", ragContext);

        try {
            // 2. Invoke LangChain4j Gemini Agent
            FitnessAnalysisDTO analysis = fitnessCoachAgent.analyzeActivity(
                    ragContext,
                    activity.getType() != null ? activity.getType() : "General Workout",
                    activity.getDuration(),
                    activity.getCaloriesBurned(),
                    activity.getAdditionalMetrics() != null ? activity.getAdditionalMetrics().toString() : "Standard"
            );

            log.info("LangChain4j Gemini Analysis generated successfully.");

            StringBuilder fullRecommendation = new StringBuilder();
            if (analysis.getOverallAnalysis() != null) fullRecommendation.append("Overall: ").append(analysis.getOverallAnalysis()).append("\n\n");
            if (analysis.getPaceAnalysis() != null) fullRecommendation.append("Pace: ").append(analysis.getPaceAnalysis()).append("\n\n");
            if (analysis.getHeartRateAnalysis() != null) fullRecommendation.append("Heart Rate: ").append(analysis.getHeartRateAnalysis()).append("\n\n");
            if (analysis.getCalorieAnalysis() != null) fullRecommendation.append("Calories: ").append(analysis.getCalorieAnalysis());

            return Recommendation.builder()
                    .activityId(activity.getId())
                    .userId(activity.getUserId())
                    .activityType(activity.getType())
                    .recommendation(fullRecommendation.toString().trim())
                    .improvements(analysis.getImprovements() != null ? analysis.getImprovements() : Collections.emptyList())
                    .suggestions(analysis.getWorkoutSuggestions() != null ? analysis.getWorkoutSuggestions() : Collections.emptyList())
                    .safety(analysis.getSafetyGuidelines() != null ? analysis.getSafetyGuidelines() : Collections.emptyList())
                    .createdAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.warn("Gemini AI API call encountered an exception ({}), using RAG Knowledge Base to construct rule-augmented fallback recommendation.", e.getMessage());
            return createRAGFallbackRecommendation(activity, ragContext);
        }
    }

    private Recommendation createRAGFallbackRecommendation(Activity activity, String ragContext) {
        String type = activity.getType() != null ? activity.getType().toUpperCase() : "WORKOUT";
        return Recommendation.builder()
                .activityId(activity.getId())
                .userId(activity.getUserId())
                .activityType(activity.getType())
                .recommendation(String.format("AI RAG Coach Analysis for %s:\nCompleted %d minutes of %s burning approximately %d calories.\n\nSports Science Context:\n%s",
                        type, activity.getDuration(), type, activity.getCaloriesBurned(), ragContext))
                .improvements(Arrays.asList(
                        "Maintain consistent pacing during peak duration",
                        "Optimize post-workout hydration within 30 minutes"
                ))
                .suggestions(Arrays.asList(
                        "Zone 2 Active Recovery Walk (30 mins)",
                        "Targeted lower body mobility & hamstring stretch (15 mins)"
                ))
                .safety(Arrays.asList(
                        "Perform dynamic warmup before high intensity exertion",
                        "Monitor resting heart rate for signs of overtraining",
                        "Ensure adequate electrolyte intake post workout"
                ))
                .createdAt(LocalDateTime.now())
                .build();
    }
}
