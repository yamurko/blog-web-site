package com.blog.backend.repository;

import com.blog.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByPublishedTrue(Pageable pageable);

    Page<Post> findByCategoryIdAndPublishedTrue(Long categoryId, Pageable pageable);

    Page<Post> findByAuthorId(Long authorId, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE LOWER(t) = LOWER(:tag) AND p.published = true")
    Page<Post> findByTag(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.published = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.summary) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
