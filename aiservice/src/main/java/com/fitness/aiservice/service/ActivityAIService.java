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
        log.info("Starting LangChain4j Dual-Domain (Workout + Diet) RAG AI Recommendation flow for activity ID: {}", activity.getId());

        // 1. Retrieve unified workout + diet context via Vector Search (RAG)
        String ragContext = knowledgeBaseService.retrieveUnifiedContext(
                activity.getType(),
                activity.getDuration(),
                activity.getCaloriesBurned()
        );
        log.info("Dual-Domain RAG Context Retrieved from Chunked Vector Store:\n{}", ragContext);

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
            if (analysis.getPaceAnalysis() != null) fullRecommendation.append("Pace & Mechanics: ").append(analysis.getPaceAnalysis()).append("\n\n");
            if (analysis.getHeartRateAnalysis() != null) fullRecommendation.append("Heart Rate & Exertion: ").append(analysis.getHeartRateAnalysis()).append("\n\n");
            if (analysis.getCalorieAnalysis() != null) fullRecommendation.append("Caloric Burn: ").append(analysis.getCalorieAnalysis());

            return Recommendation.builder()
                    .activityId(activity.getId())
                    .userId(activity.getUserId())
                    .activityType(activity.getType())
                    .duration(activity.getDuration())
                    .caloriesBurned(activity.getCaloriesBurned())
                    .recommendation(fullRecommendation.toString().trim())
                    .dietGuidance(analysis.getDietGuidance() != null ? analysis.getDietGuidance() : extractDietGuidanceFallback(activity))
                    .hydrationPlan(analysis.getHydrationPlan() != null ? analysis.getHydrationPlan() : extractHydrationFallback(activity))
                    .improvements(analysis.getImprovements() != null ? analysis.getImprovements() : Collections.emptyList())
                    .suggestions(analysis.getWorkoutSuggestions() != null ? analysis.getWorkoutSuggestions() : Collections.emptyList())
                    .safety(analysis.getSafetyGuidelines() != null ? analysis.getSafetyGuidelines() : Collections.emptyList())
                    .nutritionTips(analysis.getNutritionTips() != null ? analysis.getNutritionTips() : extractNutritionTips(activity))
                    .createdAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.warn("Gemini AI API call encountered an exception ({}), using Unstructured RAG Knowledge Base to construct rule-augmented fallback recommendation.", e.getMessage());
            return createRAGFallbackRecommendation(activity, ragContext);
        }
    }

    private Recommendation createRAGFallbackRecommendation(Activity activity, String ragContext) {
        String type = activity.getType() != null ? activity.getType().toUpperCase() : "WORKOUT";
        int duration = activity.getDuration() > 0 ? activity.getDuration() : 30;
        int calories = activity.getCaloriesBurned() > 0 ? activity.getCaloriesBurned() : 300;

        return Recommendation.builder()
                .activityId(activity.getId())
                .userId(activity.getUserId())
                .activityType(activity.getType())
                .duration(duration)
                .caloriesBurned(calories)
                .recommendation(String.format("AI Coach Biomechanics Analysis for %s:\nCompleted %d minutes of %s burning approximately %d calories.\n\nRetrieved Sports Science Guidelines:\n%s",
                        type, duration, type, calories, ragContext))
                .dietGuidance(extractDietGuidanceFallback(activity))
                .hydrationPlan(extractHydrationFallback(activity))
                .improvements(Arrays.asList(
                        "Maintain steady pacing within target aerobic / exertion thresholds",
                        "Control eccentric phase (3s negative) on compound strength lifts",
                        "Ensure 48h recovery before repeating maximal intensity sessions"
                ))
                .suggestions(Arrays.asList(
                        "Zone 2 Active Recovery Walk / Light Swim (25-30 mins)",
                        "Targeted lower body & hip mobility sequence (15 mins)",
                        "Core stability and rotational trunk control session"
                ))
                .safety(Arrays.asList(
                        "Perform 8-10 minute dynamic warmup before all high-intensity lifts or sprints",
                        "Monitor morning resting heart rate for early signs of overreaching",
                        "Avoid static stretching prior to maximal power or heavy lifting sets"
                ))
                .nutritionTips(extractNutritionTips(activity))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private String extractDietGuidanceFallback(Activity activity) {
        int calories = activity.getCaloriesBurned() > 0 ? activity.getCaloriesBurned() : 300;
        int targetProteinGrams = Math.min(40, Math.max(25, (int)(activity.getDuration() * 0.75)));
        int targetCarbsGrams = Math.min(80, Math.max(30, (int)(calories * 0.12)));

        return String.format("Post-Workout Nutrition Strategy:\n" +
                "• Anabolic Window: Ingest %dg high-biological-value protein (whey isolate, eggs, or plant isolate) within 45 minutes.\n" +
                "• Glycogen Replenishment: Pair with %dg fast-to-moderate digesting carbs (banana, oats, sweet potatoes) to restore muscle glycogen.\n" +
                "• Daily Target: Maintain 1.6-2.2g protein per kg bodyweight distributed over 3-5 meals.",
                targetProteinGrams, targetCarbsGrams);
    }

    private String extractHydrationFallback(Activity activity) {
        int duration = activity.getDuration() > 0 ? activity.getDuration() : 30;
        int mlNeeded = (int)(duration * 12.5) + 350;

        return String.format("Hydration & Electrolyte Protocol:\n" +
                "• Immediate Rehydration: Drink %d ml of water within 90 minutes post-session.\n" +
                "• Electrolytes: Replenish ~400mg sodium and 200mg potassium to prevent cramping and maintain plasma volume.\n" +
                "• Bedtime: Consider 200-300mg magnesium glycinate to support neuromuscular recovery and deep sleep.",
                mlNeeded);
    }

    private List<String> extractNutritionTips(Activity activity) {
        return Arrays.asList(
                "Consume 25-35g protein within 45 mins post-workout to trigger muscle protein synthesis (mTOR)",
                "Combine carbohydrates with protein post-workout to accelerate glycogen supercompensation",
                "Include omega-3 fatty acids (EPA/DHA) with dinner to mitigate exercise-induced inflammation",
                "Maintain hydration with electrolyte-infused water (sodium, potassium, magnesium)"
        );
    }
}
