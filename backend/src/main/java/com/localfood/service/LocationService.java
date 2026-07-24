package com.localfood.service;

import com.localfood.dto.LocationRequest;
import com.localfood.dto.LocationResponse;
import java.util.List;

public interface LocationService {
    List<LocationResponse> findAll();
    LocationResponse findById(String id);
    LocationResponse create(LocationRequest request);
    LocationResponse update(String id, LocationRequest request);
    void delete(String id);
}