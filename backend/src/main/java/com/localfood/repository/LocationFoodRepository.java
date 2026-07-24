package com.localfood.repository;

import com.localfood.model.LocationFood;
import com.localfood.model.LocationFoodId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LocationFoodRepository extends JpaRepository<LocationFood, LocationFoodId> {
    List<LocationFood> findByLocation_Id(String locationId);
}