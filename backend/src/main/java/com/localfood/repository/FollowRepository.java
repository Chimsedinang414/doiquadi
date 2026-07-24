package com.localfood.repository;

import com.localfood.model.Follow;
import com.localfood.model.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {
    long countByFollowing_Id(String userId);

    long countByFollower_Id(String userId);
}