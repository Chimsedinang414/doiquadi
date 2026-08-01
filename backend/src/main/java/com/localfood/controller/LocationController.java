package com.localfood.controller;

import com.localfood.dto.LocationRequest;
import com.localfood.dto.LocationResponse;
import com.localfood.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
public class LocationController {
    private final LocationService locationService;

    @GetMapping
    public List<LocationResponse> findAll() {
        return locationService.findAll();
    }

    @GetMapping("/{id}")
    public LocationResponse findById(@PathVariable String id) {
        return locationService.findById(id);
    }

    @PostMapping
    public ResponseEntity<LocationResponse> create(@Valid @RequestBody LocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.create(request));
    }

    @GetMapping("/my")
    public List<LocationResponse> findMyLocations(@RequestParam String userId) {
        return locationService.findByUser(userId);
    }

    @PutMapping("/{id}")
    public LocationResponse update(
            @PathVariable String id, @RequestParam String userId, @Valid @RequestBody LocationRequest request) {
        return locationService.update(id, userId, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @RequestParam String userId) {
        locationService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}