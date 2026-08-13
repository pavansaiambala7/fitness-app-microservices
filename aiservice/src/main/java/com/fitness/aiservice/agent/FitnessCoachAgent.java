package com.fitness.aiservice.agent;

import com.fitness.aiservice.dto.FitnessAnalysisDTO;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

public interface FitnessCoachAgent {

    @SystemMessage("""
        You are an elite AI Fitness Coach & Exercise Scientist.
        Analyze the user's completed fitness activity using the provided sports science knowledge base context (RAG).
        
        Provide high-yield, specific, and actionable advice across all fields.
        Return the response strictly structured matching the output schema.
        """)
    @UserMessage("""
        Domain Knowledge Context (RAG):
        {{ragContext}}

        User Activity Details:
        - Activity Type: {{activityType}}
        - Duration: {{duration}} minutes
        - Calories Burned: {{calories}}
        - Additional Metrics: {{metrics}}

        Analyze this activity and generate recommendations.
        """)
    FitnessAnalysisDTO analyzeActivity(
        @V("ragContext") String ragContext,
        @V("activityType") String activityType,
        @V("duration") int duration,
        @V("calories") int calories,
        @V("metrics") String metrics
    );
}
