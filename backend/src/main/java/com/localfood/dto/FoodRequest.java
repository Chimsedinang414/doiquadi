package com.localfood.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FoodRequest(
        @NotBlank(message = "Food name is required")
        @Size(max = 255, message = "Food name must not exceed 255 characters")
        String name,
        String description,
        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        String imageUrl) {
}
