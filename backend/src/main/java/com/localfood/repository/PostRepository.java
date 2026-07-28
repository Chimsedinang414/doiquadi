package com.localfood.repository;

import com.localfood.model.Post;
import com.localfood.model.ContentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByUser_IdOrderByCreatedAtDesc(String userId);

    List<Post> findByStatusOrderByCreatedAtDesc(ContentStatus status);

    List<Post> findByUser_IdAndStatusOrderByCreatedAtDesc(String userId, ContentStatus status);

    long countByUser_Id(String userId);

    long countByStatus(ContentStatus status);

    long countByCreatedAtAfter(LocalDateTime createdAfter);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
            select p.location.id, p.location.name, count(p)
            from Post p
            where p.location is not null and p.status = :status
            group by p.location.id, p.location.name
            order by count(p) desc
            """)
    List<Object[]> findTopLocations(@Param("status") ContentStatus status, Pageable pageable);

    @Query("""
            select p from Post p
            where (:query = '' or lower(p.id) like lower(concat('%', :query, '%'))
                   or lower(p.title) like lower(concat('%', :query, '%'))
                   or lower(coalesce(p.content, '')) like lower(concat('%', :query, '%'))
                   or lower(p.user.userName) like lower(concat('%', :query, '%')))
              and (:status is null or p.status = :status)
            """)
    Page<Post> searchAdmin(
            @Param("query") String query,
            @Param("status") ContentStatus status,
            Pageable pageable);
}
