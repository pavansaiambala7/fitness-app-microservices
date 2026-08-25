package com.fitness.aiservice.service;

import com.fitness.aiservice.dto.ChunkDTO;
import com.fitness.aiservice.dto.RagChunkMatchDTO;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class FitnessKnowledgeBaseService {

    private final UnstructuredChunkingService chunkingService;

    private EmbeddingStore<TextSegment> embeddingStore;
    private EmbeddingModel embeddingModel;
    private final List<TextSegment> indexedSegments = new CopyOnWriteArrayList<>();

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

        ingestKnowledgeBase();
    }

    public synchronized void ingestKnowledgeBase() {
        log.info("Starting Unstructured Chunking & Ingestion pipeline for Workouts and Diet Knowledge...");
        indexedSegments.clear();

        List<TextSegment> chunks = chunkingService.loadAndChunkAllKnowledgeDocuments();
        if (chunks.isEmpty()) {
            log.warn("No classpath knowledge files found, using core fallback workout and diet chunks.");
            chunks = getFallbackChunks();
        }

        for (TextSegment segment : chunks) {
            try {
                var embedding = embeddingModel.embed(segment).content();
                embeddingStore.add(embedding, segment);
                indexedSegments.add(segment);
            } catch (Exception e) {
                log.error("Failed to embed and store segment: {}", e.getMessage());
            }
        }

        long workoutCount = indexedSegments.stream()
                .filter(s -> "WORKOUT".equalsIgnoreCase(getMetadataField(s, "category")))
                .count();
        long dietCount = indexedSegments.stream()
                .filter(s -> "DIET".equalsIgnoreCase(getMetadataField(s, "category")))
                .count();

        log.info("Successfully ingested {} unstructured chunks into Vector Store (Workouts: {}, Diet/Nutrition: {}).",
                indexedSegments.size(), workoutCount, dietCount);
    }

    public String retrieveRelevantContext(String activityQuery) {
        return retrieveContext(activityQuery, null, 3, 0.55);
    }

    public String retrieveWorkoutContext(String workoutQuery, int maxResults) {
        return retrieveContext(workoutQuery, "WORKOUT", maxResults, 0.50);
    }

    public String retrieveDietContext(String nutritionQuery, int maxResults) {
        return retrieveContext(nutritionQuery, "DIET", maxResults, 0.50);
    }

    public String retrieveUnifiedContext(String activityType, int duration, int caloriesBurned) {
        String workoutQuery = String.format("%s training biomechanics duration %d minutes high exertion",
                activityType != null ? activityType : "Cardio", duration);
        String dietQuery = String.format("post workout nutrition recovery protein hydration for %d calories burned in %s",
                caloriesBurned, activityType != null ? activityType : "exercise");

        String workoutContext = retrieveWorkoutContext(workoutQuery, 2);
        String dietContext = retrieveDietContext(dietQuery, 2);

        StringBuilder sb = new StringBuilder();
        sb.append("=== EXERCISE SCIENCE & WORKOUT GUIDANCE ===\n");
        sb.append(workoutContext.isBlank() ? "- Apply standard progressive overload and heart rate zone pacing.\n" : workoutContext);
        sb.append("\n=== SPORTS DIET & NUTRITIONAL RECOVERY ===\n");
        sb.append(dietContext.isBlank() ? "- Rehydrate with electrolytes and consume 25-35g protein post-workout.\n" : dietContext);

        return sb.toString();
    }

    public List<RagChunkMatchDTO> queryMatches(String query, String categoryFilter, int maxResults, double minScore) {
        try {
            var queryEmbedding = embeddingModel.embed(query).content();
            int fetchK = Math.max(maxResults * 2, 8);
            List<EmbeddingMatch<TextSegment>> matches = embeddingStore.findRelevant(queryEmbedding, fetchK, minScore);

            List<RagChunkMatchDTO> results = new ArrayList<>();
            for (EmbeddingMatch<TextSegment> match : matches) {
                TextSegment seg = match.embedded();
                String category = getMetadataField(seg, "category");

                if (categoryFilter != null && !categoryFilter.isBlank() && !categoryFilter.equalsIgnoreCase("ALL")) {
                    if (!category.equalsIgnoreCase(categoryFilter)) {
                        continue;
                    }
                }

                results.add(RagChunkMatchDTO.builder()
                        .text(seg.text())
                        .score(match.score())
                        .source(getMetadataField(seg, "source"))
                        .category(category)
                        .section(getMetadataField(seg, "section"))
                        .build());

                if (results.size() >= maxResults) {
                    break;
                }
            }
            return results;
        } catch (Exception e) {
            log.error("Error querying vector store: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<ChunkDTO> getAllChunks(String categoryFilter) {
        List<TextSegment> filtered = indexedSegments;
        if (categoryFilter != null && !categoryFilter.isBlank() && !categoryFilter.equalsIgnoreCase("ALL")) {
            filtered = indexedSegments.stream()
                    .filter(s -> categoryFilter.equalsIgnoreCase(getMetadataField(s, "category")))
                    .collect(Collectors.toList());
        }
        return chunkingService.convertToDTOs(filtered);
    }

    private String retrieveContext(String query, String categoryFilter, int maxResults, double minScore) {
        List<RagChunkMatchDTO> matches = queryMatches(query, categoryFilter, maxResults, minScore);
        if (matches.isEmpty()) {
            return "";
        }

        StringBuilder contextBuilder = new StringBuilder();
        for (RagChunkMatchDTO match : matches) {
            contextBuilder.append(String.format("- [%s | %s]: %s\n",
                    match.getCategory(), match.getSection(), match.getText().replace("\n", " ")));
        }
        return contextBuilder.toString();
    }

    private String getMetadataField(TextSegment seg, String key) {
        if (seg != null && seg.metadata() != null && seg.metadata().containsKey(key)) {
            return seg.metadata().getString(key);
        }
        return "GENERAL";
    }

    private List<TextSegment> getFallbackChunks() {
        String workoutDoc = """
            # Running & Strength Science
            Zone 2 aerobic endurance running targets 60-70% of max heart rate for mitochondrial efficiency.
            Progressive overload requires adding volume or intensity weekly. Rest 90-120 seconds for hypertrophy.
            Dynamic warmups for 8-10 minutes prevent joint strain and optimize muscle temperature.
            """;
        String dietDoc = """
            # Sports Nutrition & Hydration
            Target 1.6 to 2.2g of protein per kg bodyweight daily. Distribute across 3-5 protein-rich meals.
            Post-workout window: Ingest 25-35g fast-digesting protein and 0.5-1.0g/kg carbohydrates within 45 minutes.
            Hydration protocol: Drink 500ml pre-workout, 150-250ml every 20 mins during exertion, and replenish sodium and electrolytes.
            """;

        List<TextSegment> list = new ArrayList<>();
        list.addAll(chunkingService.chunkUnstructuredText(workoutDoc, "fallback_workouts.md", "WORKOUT"));
        list.addAll(chunkingService.chunkUnstructuredText(dietDoc, "fallback_diet.md", "DIET"));
        return list;
    }
}
