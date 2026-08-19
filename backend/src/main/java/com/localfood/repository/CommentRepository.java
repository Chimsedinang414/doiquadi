package com.localfood.repository;

import com.localfood.model.Comment;
import com.localfood.model.ContentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByPost_IdOrderByCreatedAtAsc(String postId);
    long countByPost_Id(String postId);
    long countByPost_IdAndStatus(String postId, ContentStatus status);
    List<Comment> findByPost_IdAndStatusOrderByCreatedAtAsc(String postId, ContentStatus status);
    long countByStatus(ContentStatus status);
    long countByCreatedAtAfter(LocalDateTime createdAfter);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
            select c from Comment c
            where (:query = '' or lower(c.id) like lower(concat('%', :query, '%'))
                   or lower(c.content) like lower(concat('%', :query, '%'))
                   or lower(c.user.userName) like lower(concat('%', :query, '%')))
              and (:status is null or c.status = :status)
            """)
    Page<Comment> searchAdmin(
            @Param("query") String query,
            @Param("status") ContentStatus status,
            Pageable pageable);
}
