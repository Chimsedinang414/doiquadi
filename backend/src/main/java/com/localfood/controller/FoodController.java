package com.localfood.controller;

import com.localfood.dto.FoodRequest;
import com.localfood.dto.FoodResponse;
import com.localfood.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/foods")
@RequiredArgsConstructor
public class FoodController {
    private final FoodService foodService;

    @GetMapping
    public List<FoodResponse> findAll() {
        return foodService.findAll();
    }

    @GetMapping("/{id}")
    public FoodResponse findById(@PathVariable String id) {
        return foodService.findById(id);
    }

    @PostMapping
    public ResponseEntity<FoodResponse> create(@Valid @RequestBody FoodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foodService.create(request));
    }

    @PutMapping("/{id}")
    public FoodResponse update(@PathVariable String id, @Valid @RequestBody FoodRequest request) {
        return foodService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        foodService.delete(id);
        return ResponseEntity.noContent().build();
    }
}