package com.localfood.repository;

import com.localfood.model.LocationImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationImageRepository extends JpaRepository<LocationImage, String> {
    List<LocationImage> findByLocation_Id(String locationId);

    void deleteByLocation_Id(String locationId);
}
