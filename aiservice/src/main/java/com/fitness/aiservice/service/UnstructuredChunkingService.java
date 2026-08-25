package com.fitness.aiservice.service;

import com.fitness.aiservice.dto.ChunkDTO;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class UnstructuredChunkingService {

    @Value("${rag.chunking.max-segment-size:600}")
    private int maxSegmentSize;

    @Value("${rag.chunking.max-overlap-size:120}")
    private int maxOverlapSize;

    private static final Pattern HEADING_PATTERN = Pattern.compile("^(#{1,3})\\s+(.+)$", Pattern.MULTILINE);

    /**
     * Loads all unstructured markdown and text documents from classpath resources,
     * chunks them recursively with overlap, and enriches segments with metadata.
     */
    public List<TextSegment> loadAndChunkAllKnowledgeDocuments() {
        List<TextSegment> allSegments = new ArrayList<>();
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        try {
            Resource[] resources = resolver.getResources("classpath*:knowledge/**/*.*");
            log.info("Found {} unstructured knowledge files for ingestion and chunking.", resources.length);

            for (Resource resource : resources) {
                if (resource.isReadable() && (resource.getFilename() != null &&
                        (resource.getFilename().endsWith(".md") || resource.getFilename().endsWith(".txt")))) {

                    String filename = resource.getFilename();
                    String path = resource.getURI().toString();
                    String category = determineCategory(path, filename);

                    try (InputStream is = resource.getInputStream()) {
                        String rawContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                        List<TextSegment> documentSegments = chunkUnstructuredText(rawContent, filename, category);
                        allSegments.addAll(documentSegments);
                        log.info("Chunked document '{}' [Category: {}] -> {} text segments.", filename, category, documentSegments.size());
                    } catch (Exception e) {
                        log.error("Failed to read knowledge file {}: {}", filename, e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error discovering knowledge resources: {}", e.getMessage(), e);
        }

        return allSegments;
    }

    /**
     * Chunks an unstructured text document recursively with overlap,
     * preserving semantic boundaries and enriching each chunk with metadata.
     */
    public List<TextSegment> chunkUnstructuredText(String rawText, String sourceName, String category) {
        if (rawText == null || rawText.isBlank()) {
            return Collections.emptyList();
        }

        var splitter = DocumentSplitters.recursive(maxSegmentSize, maxOverlapSize);
        Document document = Document.from(rawText, Metadata.from("source", sourceName));
        List<TextSegment> rawSegments = splitter.split(document);

        List<TextSegment> enrichedSegments = new ArrayList<>(rawSegments.size());
        for (int i = 0; i < rawSegments.size(); i++) {
            TextSegment rawSeg = rawSegments.get(i);
            String chunkText = rawSeg.text().trim();
            String sectionTitle = extractDominantHeading(chunkText, rawText);

            Map<String, Object> metaMap = new HashMap<>();
            metaMap.put("source", sourceName);
            metaMap.put("category", category != null ? category.toUpperCase() : "GENERAL");
            metaMap.put("section", sectionTitle);
            metaMap.put("chunk_index", i);
            metaMap.put("total_chunks", rawSegments.size());
            metaMap.put("char_length", chunkText.length());

            TextSegment enrichedSeg = TextSegment.from(chunkText, Metadata.from(metaMap));
            enrichedSegments.add(enrichedSeg);
        }

        return enrichedSegments;
    }

    public List<ChunkDTO> convertToDTOs(List<TextSegment> segments) {
        List<ChunkDTO> dtos = new ArrayList<>();
        for (int i = 0; i < segments.size(); i++) {
            TextSegment seg = segments.get(i);
            Metadata meta = seg.metadata();

            String source = meta != null && meta.containsKey("source") ? meta.getString("source") : "unknown";
            String category = meta != null && meta.containsKey("category") ? meta.getString("category") : "GENERAL";
            String section = meta != null && meta.containsKey("section") ? meta.getString("section") : "General Knowledge";
            int chunkIndex = meta != null && meta.containsKey("chunk_index") ? meta.getInteger("chunk_index") : i;
            int totalChunks = meta != null && meta.containsKey("total_chunks") ? meta.getInteger("total_chunks") : segments.size();

            Map<String, String> metaMap = new HashMap<>();
            if (meta != null) {
                meta.asMap().forEach((k, v) -> metaMap.put(k, String.valueOf(v)));
            }

            dtos.add(ChunkDTO.builder()
                    .id(String.format("%s-%s-chunk-%d", category.toLowerCase(), source.replace(".md", "").replace(".txt", ""), chunkIndex))
                    .category(category)
                    .source(source)
                    .section(section)
                    .content(seg.text())
                    .charLength(seg.text().length())
                    .chunkIndex(chunkIndex)
                    .totalChunks(totalChunks)
                    .metadata(metaMap)
                    .build());
        }
        return dtos;
    }

    private String determineCategory(String path, String filename) {
        String lowerPath = path.toLowerCase();
        String lowerFilename = filename.toLowerCase();
        if (lowerPath.contains("diet") || lowerPath.contains("nutrition") || lowerFilename.contains("diet") || lowerFilename.contains("nutrition")) {
            return "DIET";
        }
        if (lowerPath.contains("workout") || lowerPath.contains("running") || lowerPath.contains("strength") || lowerPath.contains("recovery")) {
            return "WORKOUT";
        }
        return "GENERAL";
    }

    private String extractDominantHeading(String chunkText, String fullDoc) {
        Matcher matcher = HEADING_PATTERN.matcher(chunkText);
        if (matcher.find()) {
            return matcher.group(2).trim();
        }
        // Fallback: search backwards in full document
        int pos = fullDoc.indexOf(chunkText.substring(0, Math.min(30, chunkText.length())));
        if (pos > 0) {
            String priorText = fullDoc.substring(0, pos);
            Matcher priorMatcher = HEADING_PATTERN.matcher(priorText);
            String lastHeading = "General Guidance";
            while (priorMatcher.find()) {
                lastHeading = priorMatcher.group(2).trim();
            }
            return lastHeading;
        }
        return "General Guidance";
    }
}
