package com.fitness.aiservice.controller;

import com.fitness.aiservice.dto.ChunkDTO;
import com.fitness.aiservice.dto.RagChunkMatchDTO;
import com.fitness.aiservice.dto.RagQueryRequest;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.service.FitnessKnowledgeBaseService;
import com.fitness.aiservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final FitnessKnowledgeBaseService knowledgeBaseService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Recommendation>> getUserRecommendation(@PathVariable String userId) {
        return ResponseEntity.ok(recommendationService.getUserRecommendation(userId));
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<Recommendation> getActivityRecommendation(@PathVariable String activityId) {
        return ResponseEntity.ok(recommendationService.getActivityRecommendation(activityId));
    }

    /**
     * Retrieves all unstructured knowledge chunks with optional category filter (e.g. WORKOUT, DIET)
     */
    @GetMapping("/rag/chunks")
    public ResponseEntity<List<ChunkDTO>> getRagChunks(@RequestParam(required = false, defaultValue = "ALL") String category) {
        return ResponseEntity.ok(knowledgeBaseService.getAllChunks(category));
    }

    /**
     * Performs a semantic similarity search across ingested workout and diet knowledge chunks
     */
    @PostMapping("/rag/query")
    public ResponseEntity<List<RagChunkMatchDTO>> queryRagChunks(@RequestBody RagQueryRequest request) {
        int max = request.getMaxResults() > 0 ? request.getMaxResults() : 4;
        double minScore = request.getMinScore() > 0 ? request.getMinScore() : 0.50;
        List<RagChunkMatchDTO> matches = knowledgeBaseService.queryMatches(
                request.getQuery(),
                request.getCategory(),
                max,
                minScore
        );
        return ResponseEntity.ok(matches);
    }

    /**
     * Re-indexes and chunks all unstructured knowledge documents
     */
    @PostMapping("/rag/reindex")
    public ResponseEntity<Map<String, Object>> reindexKnowledgeBase() {
        knowledgeBaseService.ingestKnowledgeBase();
        List<ChunkDTO> all = knowledgeBaseService.getAllChunks("ALL");

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "SUCCESS");
        resp.put("message", "Knowledge base reindexed and chunked successfully.");
        resp.put("totalChunks", all.size());
        resp.put("workoutChunks", all.stream().filter(c -> "WORKOUT".equalsIgnoreCase(c.getCategory())).count());
        resp.put("dietChunks", all.stream().filter(c -> "DIET".equalsIgnoreCase(c.getCategory())).count());

        return ResponseEntity.ok(resp);
    }

    /**
     * Returns summary statistics of the RAG chunking engine
     */
    @GetMapping("/rag/stats")
    public ResponseEntity<Map<String, Object>> getRagStats() {
        List<ChunkDTO> all = knowledgeBaseService.getAllChunks("ALL");
        long workoutCount = all.stream().filter(c -> "WORKOUT".equalsIgnoreCase(c.getCategory())).count();
        long dietCount = all.stream().filter(c -> "DIET".equalsIgnoreCase(c.getCategory())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalChunks", all.size());
        stats.put("workoutChunks", workoutCount);
        stats.put("dietChunks", dietCount);
        stats.put("chunkingStrategy", "LangChain4j Recursive Segment Splitter");
        stats.put("segmentSizeChars", 600);
        stats.put("overlapChars", 120);

        return ResponseEntity.ok(stats);
    }
}
