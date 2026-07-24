package com.localfood.service;

import com.localfood.dto.FoodRequest;
import com.localfood.dto.FoodResponse;
import com.localfood.exception.AppException;
import com.localfood.model.Food;
import com.localfood.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FoodServiceImpl implements FoodService {
    private final FoodRepository foodRepository;

    @Override
    public List<FoodResponse> findAll() {
        return foodRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public FoodResponse findById(String id) {
        return toResponse(requireFood(id));
    }

    @Override
    @Transactional
    public FoodResponse create(FoodRequest request) {
        Food food = new Food();
        apply(food, request);
        return toResponse(foodRepository.save(food));
    }

    @Override
    @Transactional
    public FoodResponse update(String id, FoodRequest request) {
        Food food = requireFood(id);
        apply(food, request);
        return toResponse(foodRepository.save(food));
    }

    @Override
    @Transactional
    public void delete(String id) {
        foodRepository.delete(requireFood(id));
    }

    private void apply(Food food, FoodRequest request) {
        food.setName(request.name().trim());
        food.setDescription(request.description());
        food.setImageUrl(request.imageUrl());
    }

    private Food requireFood(String id) {
        return foodRepository.findById(id).orElseThrow(() -> new AppException("Không tìm thấy món ăn"));
    }

    private FoodResponse toResponse(Food food) {
        return new FoodResponse(food.getId(), food.getName(), food.getDescription(), food.getImageUrl());
    }
}