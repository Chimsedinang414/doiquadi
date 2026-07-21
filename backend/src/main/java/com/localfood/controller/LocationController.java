package com.localfood.controller;
import com.localfood.model.Location;
import com.localfood.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
public class LocationController {
    private final LocationRepository repository;
    @GetMapping public List<Location> findAll() { return repository.findAll(); }
}
