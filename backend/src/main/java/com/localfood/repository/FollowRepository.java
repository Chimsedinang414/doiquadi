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

    @Query("select f.follower from Follow f " +
            "where f.following.id = :userId and f.follower.enabled = true " +
            "order by f.follower.fullName, f.follower.userName")
    List<User> findFollowers(@Param("userId") String userId);

    @Query("select f.following from Follow f " +
            "where f.follower.id = :userId and f.following.enabled = true " +
            "order by f.following.fullName, f.following.userName")
    List<User> findFollowing(@Param("userId") String userId);

    @Query("SELECT f.following FROM Follow f WHERE f.follower.id = :userId " +
           "AND f.following.id IN (SELECT f2.follower.id FROM Follow f2 WHERE f2.following.id = :userId)")
    List<User> findMutualFollows(@Param("userId") String userId);
}
