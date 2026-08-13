package com.fitness.aiservice.config;

import com.fitness.aiservice.agent.FitnessCoachAgent;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class LangChainConfig {

    @Value("${gemini.api.key:demo-api-key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        if ("demo-api-key".equals(geminiApiKey) || geminiApiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not explicitly set. LangChain4j Gemini model initialized in placeholder configuration mode.");
        }
        return GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName(geminiModel)
                .temperature(0.3)
                .build();
    }

    @Bean
    public FitnessCoachAgent fitnessCoachAgent(ChatLanguageModel chatLanguageModel) {
        return AiServices.builder(FitnessCoachAgent.class)
                .chatLanguageModel(chatLanguageModel)
                .build();
    }
}
