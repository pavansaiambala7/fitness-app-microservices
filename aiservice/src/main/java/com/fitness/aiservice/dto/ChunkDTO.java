package com.fitness.aiservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChunkDTO {
    private String id;
    private String category;
    private String source;
    private String section;
    private String content;
    private int charLength;
    private int chunkIndex;
    private int totalChunks;
    private Map<String, String> metadata;
}
