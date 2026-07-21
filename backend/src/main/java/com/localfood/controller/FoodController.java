package com.localfood.controller;

import com.localfood.model.Food;
import com.localfood.repository.FoodRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/foods")
@RequiredArgsConstructor
public class FoodController {
    private final FoodRepository foodRepository;

    @GetMapping
    public List<Food> findAll() {
        return foodRepository.findAll();
    }

    @PostMapping
    public Food create(@Valid @RequestBody Food food) {
        food.setId(null);
        return foodRepository.save(food);
    }
}
