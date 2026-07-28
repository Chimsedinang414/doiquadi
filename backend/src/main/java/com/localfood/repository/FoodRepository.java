package com.localfood.repository;

import com.localfood.model.Food;
import com.localfood.model.FoodStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FoodRepository extends JpaRepository<Food, String> {
    List<Food> findByStatusOrderByNameAsc(FoodStatus status);
    long countByStatus(FoodStatus status);

    @Query("""
            select f from Food f
            where (:query = '' or lower(f.id) like lower(concat('%', :query, '%'))
                   or lower(f.name) like lower(concat('%', :query, '%'))
                   or lower(coalesce(f.description, '')) like lower(concat('%', :query, '%')))
              and (:status is null or f.status = :status)
            """)
    Page<Food> searchAdmin(
            @Param("query") String query,
            @Param("status") FoodStatus status,
            Pageable pageable);
}
