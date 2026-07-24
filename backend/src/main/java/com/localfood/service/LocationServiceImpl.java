package com.localfood.service;

import com.localfood.dto.LocationRequest;
import com.localfood.dto.LocationResponse;
import com.localfood.exception.AppException;
import com.localfood.model.Location;
import com.localfood.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationServiceImpl implements LocationService {
    private final LocationRepository locationRepository;

    @Override
    public List<LocationResponse> findAll() {
        return locationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public LocationResponse findById(String id) {
        return toResponse(requireLocation(id));
    }

    @Override
    @Transactional
    public LocationResponse create(LocationRequest request) {
        Location location = new Location();
        apply(location, request);
        return toResponse(locationRepository.save(location));
    }

    @Override
    @Transactional
    public LocationResponse update(String id, LocationRequest request) {
        Location location = requireLocation(id);
        apply(location, request);
        return toResponse(locationRepository.save(location));
    }

    @Override
    @Transactional
    public void delete(String id) {
        locationRepository.delete(requireLocation(id));
    }

    private void apply(Location location, LocationRequest request) {
        location.setName(request.name().trim());
        location.setAddress(request.address());
        location.setLatitude(request.latitude());
        location.setLongitude(request.longitude());
        location.setOpenTime(request.openTime());
        location.setCloseTime(request.closeTime());
        location.setPhone(request.phone());
        location.setAveragePrice(request.averagePrice());
    }

    private Location requireLocation(String id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy địa điểm"));
    }

    private LocationResponse toResponse(Location location) {
        return new LocationResponse(location.getId(), location.getName(), location.getAddress(),
                location.getLatitude(), location.getLongitude(), location.getOpenTime(),
                location.getCloseTime(), location.getPhone(), location.getAveragePrice());
    }
}