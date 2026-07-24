package com.localfood.repository;

import com.localfood.model.Like;
import com.localfood.model.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, LikeId> {
    long countByPost_Id(String postId);
}