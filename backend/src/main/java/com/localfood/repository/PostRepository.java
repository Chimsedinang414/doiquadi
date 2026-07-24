package com.localfood.repository;

import com.localfood.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByUser_IdOrderByCreatedAtDesc(String userId);
}