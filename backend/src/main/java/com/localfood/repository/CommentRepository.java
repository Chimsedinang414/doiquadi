package com.localfood.repository;

import com.localfood.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByPost_IdOrderByCreatedAtAsc(String postId);
    long countByPost_Id(String postId);
}