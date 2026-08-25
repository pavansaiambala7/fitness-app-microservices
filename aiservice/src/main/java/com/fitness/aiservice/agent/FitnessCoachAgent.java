package com.fitness.aiservice.agent;

import com.fitness.aiservice.dto.FitnessAnalysisDTO;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

public interface FitnessCoachAgent {

    @SystemMessage("""
        You are an elite AI Fitness Coach & Sports Nutrition Scientist.
        Analyze the user's completed fitness activity using the provided Exercise Science and Sports Diet knowledge base context (RAG).
        
        Provide high-yield, specific, and actionable advice covering:
        1. Biomechanics, exertion intensity, and pacing breakdown.
        2. Post-workout nutrition, macronutrient distribution (protein, carbohydrates, healthy fats), and peri-workout fueling strategy.
        3. Precise hydration replenishment formula and electrolyte guidelines.
        4. Concrete workout improvements, next workout recommendations, and injury prevention precautions.
        
        Return the response strictly structured matching the output schema.
        """)
    @UserMessage("""
        === RAG DOMAIN KNOWLEDGE CONTEXT ===
        {{ragContext}}

        === USER ACTIVITY DETAILS ===
        - Activity Type: {{activityType}}
        - Duration: {{duration}} minutes
        - Estimated Calories Burned: {{calories}} kcal
        - Additional Telemetry/Metrics: {{metrics}}

        Analyze this activity and generate comprehensive fitness and dietary recommendations.
        """)
    FitnessAnalysisDTO analyzeActivity(
        @V("ragContext") String ragContext,
        @V("activityType") String activityType,
        @V("duration") int duration,
        @V("calories") int calories,
        @V("metrics") String metrics
    );
}
