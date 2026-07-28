package com.localfood.repository;

import com.localfood.model.Follow;
import com.localfood.model.FollowId;
import com.localfood.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {
    long countByFollowing_Id(String userId);

    long countByFollower_Id(String userId);

    @Query("SELECT f.following FROM Follow f WHERE f.follower.id = :userId " +
           "AND f.following.id IN (SELECT f2.follower.id FROM Follow f2 WHERE f2.following.id = :userId)")
    List<User> findMutualFollows(@Param("userId") String userId);
}