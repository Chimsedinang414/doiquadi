package com.localfood.admin.moderation;

import com.localfood.admin.audit.AdminAuditService;
import com.localfood.admin.common.AdminPageResponse;
import com.localfood.exception.ApiException;
import com.localfood.model.Location;
import com.localfood.model.Post;
import com.localfood.model.User;
import com.localfood.repository.LocationRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminModerationService {
    private final PostRepository postRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final AdminAuditService auditService;

    public AdminPageResponse<AdminPostResponse> findPosts(int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return AdminPageResponse.from(postRepository.findAll(pageable).map(this::toPostResponse));
    }

    public AdminPageResponse<AdminLocationResponse> findLocations(int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.ASC, "name"));
        return AdminPageResponse.from(locationRepository.findAll(pageable).map(this::toLocationResponse));
    }

    @Transactional
    public void deletePost(String postId, String actorSubject) {
        User actor = requireActor(actorSubject);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> notFound("POST_NOT_FOUND", "Không tìm thấy bài viết"));
        String title = summarize(post.getTitle());
        postRepository.delete(post);
        auditService.record(actor, "POST_DELETED", "POST", postId, "title=" + title);
    }

    @Transactional
    public void deleteLocation(String locationId, String actorSubject) {
        User actor = requireActor(actorSubject);
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> notFound("LOCATION_NOT_FOUND", "Không tìm thấy địa điểm"));
        String name = summarize(location.getName());
        locationRepository.delete(location);
        auditService.record(actor, "LOCATION_DELETED", "LOCATION", locationId, "name=" + name);
    }

    private User requireActor(String authSubject) {
        return userRepository.findByAuthSubject(authSubject)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,
                        "ADMIN_SESSION_INVALID", "Phiên quản trị không còn hợp lệ"));
    }

    private AdminPostResponse toPostResponse(Post post) {
        return new AdminPostResponse(
                post.getId(), post.getUser().getId(), post.getUser().getUserName(),
                post.getTitle(), post.getLocation() == null ? null : post.getLocation().getName(),
                post.getRating(), post.getCreatedAt());
    }

    private AdminLocationResponse toLocationResponse(Location location) {
        return new AdminLocationResponse(location.getId(), location.getName(), location.getAddress(),
                location.getPhone(), location.getAveragePrice());
    }

    private static ApiException notFound(String code, String message) {
        return new ApiException(HttpStatus.NOT_FOUND, code, message);
    }

    private static String summarize(String value) {
        if (value == null) return "";
        String normalized = value.replaceAll("[\\r\\n]+", " ").trim();
        return normalized.length() <= 120 ? normalized : normalized.substring(0, 120);
    }
}
