package com.fitness.aiservice.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
public class FitnessKnowledgeBaseService {

    private EmbeddingStore<TextSegment> embeddingStore;
    private EmbeddingModel embeddingModel;

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/fitness_vector_db}")
    private String dbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String dbUser;

    @Value("${spring.datasource.password:postgres}")
    private String dbPassword;

    @Value("${pgvector.enabled:false}")
    private boolean pgvectorEnabled;

    @PostConstruct
    public void init() {
        this.embeddingModel = new AllMiniLmL6V2EmbeddingModel();

        if (pgvectorEnabled) {
            try {
                log.info("Initializing PgVectorEmbeddingStore connected to PostgreSQL pgvector database...");
                this.embeddingStore = PgVectorEmbeddingStore.builder()
                        .host("localhost")
                        .port(5432)
                        .database("fitness_vector_db")
                        .table("fitness_knowledge_vectors")
                        .dimension(384)
                        .user(dbUser)
                        .password(dbPassword)
                        .build();
            } catch (Exception e) {
                log.warn("Failed to initialize PgVectorEmbeddingStore, falling back to InMemoryEmbeddingStore: {}", e.getMessage());
                this.embeddingStore = new InMemoryEmbeddingStore<>();
            }
        } else {
            log.info("PgVector disabled by default, initializing high-performance InMemoryEmbeddingStore for RAG...");
            this.embeddingStore = new InMemoryEmbeddingStore<>();
        }

        seedFitnessKnowledgeBase();
    }

    private void seedFitnessKnowledgeBase() {
        log.info("Seeding Fitness Knowledge Base into Vector Store for RAG...");
        List<String> knowledgeDocs = Arrays.asList(
            "RUNNING SCIENCE: Target heart rate for Zone 2 aerobic endurance running is 60-70% of Max HR. Maintain a steady pace where you can comfortably converse. High intensity running (>85% HR max) requires 48h recovery between sessions.",
            "STRENGTH TRAINING & OVERLOAD: Progressive overload requires increasing volume, load, or decreasing rest periods weekly. For hypertrophy, target 3-5 sets of 8-12 reps per muscle group with 90-120 seconds rest.",
            "CYCLING & CARDIO EFFICIENCY: Cadence for optimal energy efficiency is 80-90 RPM. High resistance low cadence climbing puts excess strain on knees. Post-cycling stretching must focus on hip flexors and hamstrings.",
            "HYDRATION & RECOVERY PROTOCOL: Consume 500ml water 2 hours before exercise and 150-250ml every 20 minutes during prolonged exertion (>45 mins). Post-workout electrolyte restoration prevents muscle cramps.",
            "INJURY PREVENTION & FATIGUE MANAGEMENT: If heart rate during resting state or standard pace spikes by >10% compared to baseline, reduce intensity to prevent overtraining syndrome. Warmup dynamically for 5-10 minutes before all compound lifts or sprint sessions.",
            "CALORIC BURNING & MACRONUTRIENT BALANCE: High-intensity interval training (HIIT) continues burning calories post-workout via excess post-exercise oxygen consumption (EPOC). Consume 20-30g whey protein within 45 mins post workout."
        );

        for (String text : knowledgeDocs) {
            TextSegment segment = TextSegment.from(text);
            var embedding = embeddingModel.embed(segment).content();
            embeddingStore.add(embedding, segment);
        }
        log.info("Successfully ingested {} fitness knowledge vectors into vector store.", knowledgeDocs.size());
    }

    public String retrieveRelevantContext(String activityQuery) {
        try {
            var queryEmbedding = embeddingModel.embed(activityQuery).content();
            List<EmbeddingMatch<TextSegment>> matches = embeddingStore.findRelevant(queryEmbedding, 3, 0.6);

            StringBuilder contextBuilder = new StringBuilder();
            for (EmbeddingMatch<TextSegment> match : matches) {
                contextBuilder.append("- ").append(match.embedded().text()).append("\n");
            }
            return contextBuilder.toString();
        } catch (Exception e) {
            log.error("Error retrieving context from vector store: {}", e.getMessage());
            return "General fitness guidelines apply.";
        }
    }
}
