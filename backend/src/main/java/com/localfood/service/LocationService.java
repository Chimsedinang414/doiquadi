package com.localfood.service;

import com.localfood.dto.LocationRequest;
import com.localfood.dto.LocationResponse;
import java.util.List;

public interface LocationService {
    List<LocationResponse> findAll();
    List<LocationResponse> findByUser(String userId);
    LocationResponse findById(String id);
    LocationResponse create(LocationRequest request);
    LocationResponse update(String id, String userId, LocationRequest request);
    void delete(String id, String userId);
}