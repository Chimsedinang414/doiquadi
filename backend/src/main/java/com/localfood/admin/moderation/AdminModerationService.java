package com.localfood.admin.moderation;

import com.localfood.admin.audit.AdminAuditService;
import com.localfood.admin.common.AdminPageResponse;
import com.localfood.admin.report.ReportRepository;
import com.localfood.admin.report.ReportTargetType;
import com.localfood.exception.ApiException;
import com.localfood.model.Comment;
import com.localfood.model.ContentStatus;
import com.localfood.model.Food;
import com.localfood.model.FoodStatus;
import com.localfood.model.Location;
import com.localfood.model.LocationStatus;
import com.localfood.model.Post;
import com.localfood.model.PostImage;
import com.localfood.model.User;
import com.localfood.repository.CommentRepository;
import com.localfood.repository.FoodRepository;
import com.localfood.repository.LocationRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.PostImageRepository;
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
    private final PostImageRepository postImageRepository;
    private final CommentRepository commentRepository;
    private final LocationRepository locationRepository;
    private final FoodRepository foodRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AdminAuditService auditService;

    public AdminPageResponse<AdminPostResponse> findPosts(
            String query, ContentStatus status, int page, int size) {
        var pageable = page(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return AdminPageResponse.from(postRepository.searchAdmin(normalizeQuery(query), status, pageable)
                .map(this::toPostResponse));
    }

    public AdminPostResponse findPost(String id) {
        return toPostResponse(requirePost(id));
    }

    public AdminPageResponse<AdminCommentResponse> findComments(
            String query, ContentStatus status, int page, int size) {
        var pageable = page(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return AdminPageResponse.from(commentRepository.searchAdmin(normalizeQuery(query), status, pageable)
                .map(this::toCommentResponse));
    }

    public AdminCommentResponse findComment(String id) {
        return toCommentResponse(requireComment(id));
    }

    public AdminPageResponse<AdminLocationResponse> findLocations(
            String query, LocationStatus status, int page, int size) {
        var pageable = page(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return AdminPageResponse.from(locationRepository.searchAdmin(normalizeQuery(query), status, pageable)
                .map(this::toLocationResponse));
    }

    public AdminLocationResponse findLocation(String id) {
        return toLocationResponse(requireLocation(id));
    }

    public AdminPageResponse<AdminFoodResponse> findFoods(
            String query, FoodStatus status, int page, int size) {
        var pageable = page(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return AdminPageResponse.from(foodRepository.searchAdmin(normalizeQuery(query), status, pageable)
                .map(this::toFoodResponse));
    }

    @Transactional
    public AdminPostResponse updatePostStatus(
            String id, ContentStatus status, String reason, String actorSubject) {
        User actor = requireActor(actorSubject);
        Post post = requirePost(id);
        ContentStatus previous = post.getStatus();
        post.setStatus(status);
        post.setModerationReason(normalizeReason(reason));
        auditService.record(actor, postAction(status), "POST", id,
                "old=" + previous + "; new=" + status + "; reason=" + normalizeReason(reason));
        return toPostResponse(post);
    }

    @Transactional
    public AdminCommentResponse updateCommentStatus(
            String id, ContentStatus status, String reason, String actorSubject) {
        User actor = requireActor(actorSubject);
        Comment comment = requireComment(id);
        ContentStatus previous = comment.getStatus();
        comment.setStatus(status);
        comment.setModerationReason(normalizeReason(reason));
        auditService.record(actor, contentAction("COMMENT", status), "COMMENT", id,
                "old=" + previous + "; new=" + status + "; reason=" + normalizeReason(reason));
        return toCommentResponse(comment);
    }

    @Transactional
    public AdminLocationResponse updateLocationStatus(
            String id, LocationStatus status, String reason, String actorSubject) {
        User actor = requireActor(actorSubject);
        Location location = requireLocation(id);
        LocationStatus previous = location.getStatus();
        location.setStatus(status);
        location.setModerationReason(normalizeReason(reason));
        auditService.record(actor, locationAction(status), "LOCATION", id,
                "old=" + previous + "; new=" + status + "; reason=" + normalizeReason(reason));
        return toLocationResponse(location);
    }

    @Transactional
    public AdminFoodResponse updateFood(
            String id, ModerationRequests.FoodUpdate request, String actorSubject) {
        User actor = requireActor(actorSubject);
        Food food = requireFood(id);
        String previous = "name=" + food.getName() + ", status=" + food.getStatus();
        food.setName(request.name().trim());
        food.setDescription(trimToNull(request.description()));
        food.setImageUrl(trimToNull(request.imageUrl()));
        food.setStatus(request.status());
        food.setModerationReason(normalizeReason(request.reason()));
        auditService.record(actor, "DISH_UPDATED", "DISH", id,
                "old=" + previous + "; newStatus=" + request.status() + "; reason=" + request.reason().trim());
        return toFoodResponse(food);
    }

    private AdminPostResponse toPostResponse(Post post) {
        return new AdminPostResponse(
                post.getId(), post.getUser().getId(), post.getUser().getUserName(),
                post.getTitle(), post.getContent(),
                post.getLocation() == null ? null : post.getLocation().getName(),
                post.getRating(), postImageRepository.findByPost_Id(post.getId()).stream()
                        .map(PostImage::getImageUrl).toList(),
                post.getStatus(), post.getModerationReason(),
                reportRepository.countByTargetTypeAndTargetId(ReportTargetType.POST, post.getId()),
                post.getCreatedAt());
    }

    private AdminCommentResponse toCommentResponse(Comment comment) {
        return new AdminCommentResponse(
                comment.getId(), comment.getPost().getId(), comment.getPost().getTitle(),
                comment.getUser().getId(), comment.getUser().getUserName(), comment.getContent(),
                comment.getStatus(), comment.getModerationReason(),
                reportRepository.countByTargetTypeAndTargetId(ReportTargetType.COMMENT, comment.getId()),
                comment.getCreatedAt());
    }

    private AdminLocationResponse toLocationResponse(Location location) {
        return new AdminLocationResponse(
                location.getId(), location.getName(), location.getAddress(), location.getLatitude(),
                location.getLongitude(), location.getPhone(), location.getAveragePrice(),
                location.getStatus(), location.getModerationReason(),
                reportRepository.countByTargetTypeAndTargetId(ReportTargetType.LOCATION, location.getId()));
    }

    private AdminFoodResponse toFoodResponse(Food food) {
        return new AdminFoodResponse(
                food.getId(), food.getName(), food.getDescription(), food.getImageUrl(),
                food.getStatus(), food.getModerationReason(),
                reportRepository.countByTargetTypeAndTargetId(ReportTargetType.REVIEW, food.getId()));
    }

    private User requireActor(String authSubject) {
        return userRepository.findByAuthSubject(authSubject).orElseThrow(() ->
                new ApiException(HttpStatus.UNAUTHORIZED, "ADMIN_SESSION_INVALID", "Phiên quản trị không hợp lệ"));
    }

    private Post requirePost(String id) {
        return postRepository.findById(id).orElseThrow(() -> notFound("POST_NOT_FOUND", "Không tìm thấy bài viết"));
    }

    private Comment requireComment(String id) {
        return commentRepository.findById(id).orElseThrow(() -> notFound("COMMENT_NOT_FOUND", "Không tìm thấy bình luận"));
    }

    private Location requireLocation(String id) {
        return locationRepository.findById(id).orElseThrow(() -> notFound("LOCATION_NOT_FOUND", "Không tìm thấy địa điểm"));
    }

    private Food requireFood(String id) {
        return foodRepository.findById(id).orElseThrow(() -> notFound("DISH_NOT_FOUND", "Không tìm thấy món ăn"));
    }

    private static PageRequest page(int page, int size, Sort sort) {
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);
    }

    private static String normalizeQuery(String query) {
        return query == null ? "" : query.trim();
    }

    private static String normalizeReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MODERATION_REASON_REQUIRED",
                    "Thao tác kiểm duyệt phải có lý do");
        }
        return reason.trim();
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String postAction(ContentStatus status) {
        return contentAction("POST", status);
    }

    private static String contentAction(String prefix, ContentStatus status) {
        return switch (status) {
            case ACTIVE -> prefix + "_RESTORED";
            case UNDER_REVIEW -> prefix + "_UNDER_REVIEW";
            case HIDDEN -> prefix + "_HIDDEN";
            case DELETED -> prefix + "_DELETED";
        };
    }

    private static String locationAction(LocationStatus status) {
        return switch (status) {
            case VERIFIED -> "LOCATION_APPROVED";
            case REJECTED -> "LOCATION_REJECTED";
            default -> "LOCATION_STATUS_CHANGED";
        };
    }

    private static ApiException notFound(String code, String message) {
        return new ApiException(HttpStatus.NOT_FOUND, code, message);
    }
}
