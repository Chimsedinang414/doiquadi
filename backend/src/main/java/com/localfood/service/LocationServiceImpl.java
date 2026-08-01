package com.localfood.service;

import com.localfood.dto.LocationRequest;
import com.localfood.dto.LocationResponse;
import com.localfood.exception.AppException;
import com.localfood.model.Location;
import com.localfood.model.LocationImage;
import com.localfood.model.LocationStatus;
import com.localfood.model.User;
import com.localfood.repository.LocationImageRepository;
import com.localfood.repository.LocationRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationServiceImpl implements LocationService {
    private final LocationRepository locationRepository;
    private final LocationImageRepository locationImageRepository;
    private final StorageService storageService;
    private final UserRepository userRepository;

    @Override
    public List<LocationResponse> findAll() {
        return locationRepository.findByStatusOrderByNameAsc(LocationStatus.VERIFIED)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<LocationResponse> findByUser(String userId) {
        return locationRepository.findByCreatedBy_IdAndStatusOrderByNameAsc(userId, LocationStatus.VERIFIED)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public LocationResponse findById(String id) {
        return toResponse(requireVisibleLocation(id));
    }

    @Override
    @Transactional
    public LocationResponse create(LocationRequest request) {
        Location location = new Location();
        apply(location, request);
        
        if (request.userId() != null && !request.userId().isBlank()) {
            User creator = userRepository.findById(request.userId())
                    .orElseThrow(() -> new AppException("User not found"));
            location.setCreatedBy(creator);
        }
        
        Location saved = locationRepository.save(location);
        replaceImages(saved, request);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public LocationResponse update(String id, String userId, LocationRequest request) {
        Location location = requireLocation(id);
        if (location.getCreatedBy() == null || !location.getCreatedBy().getId().equals(userId)) {
            throw new AppException("Bạn không có quyền chỉnh sửa địa điểm này");
        }
        apply(location, request);
        Location saved = locationRepository.save(location);
        if (request.imageKeys() != null) {
            replaceImages(saved, request);
        }
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(String id, String userId) {
        Location location = requireLocation(id);
        if (location.getCreatedBy() == null || !location.getCreatedBy().getId().equals(userId)) {
            throw new AppException("Bạn không có quyền xóa địa điểm này");
        }
        locationRepository.delete(location);
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

    private Location requireVisibleLocation(String id) {
        Location location = requireLocation(id);
        if (location.getStatus() != LocationStatus.VERIFIED) {
            throw new AppException("Không tìm thấy địa điểm");
        }
        return location;
    }


    private void replaceImages(Location location, LocationRequest request) {
        List<String> imageKeys = request.imageKeys() == null
                ? List.of()
                : request.imageKeys().stream()
                        .filter(key -> key != null && !key.isBlank())
                        .distinct()
                        .toList();
        if (imageKeys.size() > 10) {
            throw new AppException("Mỗi địa điểm chỉ được tải tối đa 10 ảnh");
        }
        if (!imageKeys.isEmpty() && (request.userId() == null || request.userId().isBlank())) {
            throw new AppException("Bạn cần đăng nhập để tải ảnh địa điểm");
        }

        locationImageRepository.deleteByLocation_Id(location.getId());
        for (String key : imageKeys) {
            StorageService.StoredObject uploaded = storageService.requireUploadedImage(request.userId(), key);
            LocationImage image = new LocationImage();
            image.setLocation(location);
            image.setStorageKey(uploaded.objectKey());
            image.setImageUrl(uploaded.publicUrl());
            locationImageRepository.save(image);
        }
    }
    private LocationResponse toResponse(Location location) {
        List<String> imageUrls = locationImageRepository.findByLocation_Id(location.getId()).stream()
                .map(LocationImage::getImageUrl)
                .toList();
        String createdById = location.getCreatedBy() != null ? location.getCreatedBy().getId() : null;
        return new LocationResponse(location.getId(), location.getName(), location.getAddress(),
                location.getLatitude(), location.getLongitude(), location.getOpenTime(),
                location.getCloseTime(), location.getPhone(), location.getAveragePrice(), imageUrls, createdById);
    }
}
