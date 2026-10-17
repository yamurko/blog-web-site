package com.blog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

public class BlogDtos {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PostRequest {
        @NotBlank(message = "Başlık boş olamaz")
        private String title;

        @NotBlank(message = "İçerik boş olamaz")
        private String content;

        private String summary;
        private Long categoryId;
        private Set<String> tags;
        private Boolean published;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PostResponse {
        private Long id;
        private String title;
        private String content;
        private String summary;
        private Long authorId;
        private String authorUsername;
        private CategoryDto category;
        private Set<String> tags;
        private boolean published;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryDto {
        private Long id;
        @NotBlank(message = "Kategori adı boş olamaz")
        private String name;
        @NotBlank(message = "Kategori slug boş olamaz")
        private String slug;
        private String description;
    }
}
