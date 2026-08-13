package com.fitness.aiservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FitnessAnalysisDTO {
    private String overallAnalysis;
    private String paceAnalysis;
    private String heartRateAnalysis;
    private String calorieAnalysis;
    private List<String> improvements;
    private List<String> workoutSuggestions;
    private List<String> safetyGuidelines;
}
