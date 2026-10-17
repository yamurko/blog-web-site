package com.blog.backend.service;

import com.blog.backend.dto.BlogDtos.CategoryDto;
import com.blog.backend.dto.BlogDtos.PostRequest;
import com.blog.backend.dto.BlogDtos.PostResponse;
import com.blog.backend.entity.Category;
import com.blog.backend.entity.Post;
import com.blog.backend.entity.Role;
import com.blog.backend.entity.User;
import com.blog.backend.repository.CategoryRepository;
import com.blog.backend.repository.PostRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<PostResponse> getPublishedPosts(Long categoryId, String tag, String keyword, Pageable pageable) {
        Page<Post> posts;
        if (categoryId != null) {
            posts = postRepository.findByCategoryIdAndPublishedTrue(categoryId, pageable);
        } else if (tag != null && !tag.isBlank()) {
            posts = postRepository.findByTag(tag.trim(), pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            posts = postRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            posts = postRepository.findByPublishedTrue(pageable);
        }
        return posts.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Blog yazısı bulunamadı: " + id));
        return mapToResponse(post);
    }

    @Transactional
    public PostResponse createPost(PostRequest request, User currentUser) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Kategori bulunamadı: " + request.getCategoryId()));
        }

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .summary(request.getSummary())
                .author(currentUser)
                .category(category)
                .tags(request.getTags() != null ? request.getTags() : new HashSet<>())
                .published(request.getPublished() != null ? request.getPublished() : true)
                .build();

        return mapToResponse(postRepository.save(post));
    }

    @Transactional
    public PostResponse updatePost(Long id, PostRequest request, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Blog yazısı bulunamadı: " + id));

        validateAuthorOrAdmin(post, currentUser);

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Kategori bulunamadı: " + request.getCategoryId()));
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setSummary(request.getSummary());
        post.setCategory(category);
        if (request.getTags() != null) {
            post.setTags(request.getTags());
        }
        if (request.getPublished() != null) {
            post.setPublished(request.getPublished());
        }

        return mapToResponse(postRepository.save(post));
    }

    @Transactional
    public void deletePost(Long id, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Blog yazısı bulunamadı: " + id));

        validateAuthorOrAdmin(post, currentUser);
        postRepository.delete(post);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .description(c.getDescription())
                        .build())
                .toList();
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        Category category = Category.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .build();
        Category saved = categoryRepository.save(category);
        return CategoryDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .slug(saved.getSlug())
                .description(saved.getDescription())
                .build();
    }

    private void validateAuthorOrAdmin(Post post, User currentUser) {
        boolean isAuthor = post.getAuthor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        if (!isAuthor && !isAdmin) {
            throw new AccessDeniedException("Bu yazıyı düzenleme veya silme yetkiniz yok.");
        }
    }

    private PostResponse mapToResponse(Post post) {
        CategoryDto categoryDto = null;
        if (post.getCategory() != null) {
            Category c = post.getCategory();
            categoryDto = CategoryDto.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .slug(c.getSlug())
                    .description(c.getDescription())
                    .build();
        }

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .summary(post.getSummary())
                .authorId(post.getAuthor().getId())
                .authorUsername(post.getAuthor().getUsername())
                .category(categoryDto)
                .tags(post.getTags())
                .published(post.isPublished())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
