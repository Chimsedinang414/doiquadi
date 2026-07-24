package com.localfood.service;

import com.localfood.dto.FoodRequest;
import com.localfood.dto.FoodResponse;
import java.util.List;

public interface FoodService {
    List<FoodResponse> findAll();
    FoodResponse findById(String id);
    FoodResponse create(FoodRequest request);
    FoodResponse update(String id, FoodRequest request);
    void delete(String id);
}