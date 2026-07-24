package com.localfood.repository;

import com.localfood.model.Favorite;
import com.localfood.model.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    List<Favorite> findByUser_Id(String userId);
}