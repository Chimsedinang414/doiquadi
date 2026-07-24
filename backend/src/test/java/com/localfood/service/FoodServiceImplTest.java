package com.localfood.service;

import com.localfood.dto.FoodRequest;
import com.localfood.dto.FoodResponse;
import com.localfood.exception.AppException;
import com.localfood.model.Food;
import com.localfood.repository.FoodRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FoodServiceImplTest {
    @Mock
    private FoodRepository foodRepository;

    @InjectMocks
    private FoodServiceImpl foodService;

    @Test
    void createMapsAndSavesFood() {
        Food saved = new Food();
        saved.setId("food-id");
        saved.setName("Phở");
        saved.setDescription("Phở bò");
        saved.setImageUrl("https://example.com/pho.jpg");
        when(foodRepository.save(any(Food.class))).thenReturn(saved);

        FoodResponse response = foodService.create(
                new FoodRequest("  Phở  ", "Phở bò", "https://example.com/pho.jpg"));

        assertEquals("food-id", response.id());
        assertEquals("Phở", response.name());
        verify(foodRepository).save(any(Food.class));
    }

    @Test
    void findByIdRejectsUnknownFood() {
        when(foodRepository.findById("missing")).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> foodService.findById("missing"));

        assertEquals("Không tìm thấy món ăn", exception.getMessage());
    }

    @Test
    void deleteRemovesExistingFood() {
        Food food = new Food();
        food.setId("food-id");
        when(foodRepository.findById("food-id")).thenReturn(Optional.of(food));

        foodService.delete("food-id");

        verify(foodRepository).delete(food);
    }
}