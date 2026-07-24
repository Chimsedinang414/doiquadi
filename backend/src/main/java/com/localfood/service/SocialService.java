package com.localfood.service;

import com.localfood.dto.SocialDtos;
import com.localfood.exception.AppException;
import com.localfood.model.Checkin;
import com.localfood.model.CheckinId;
import com.localfood.model.Collection;
import com.localfood.model.CollectionItem;
import com.localfood.model.CollectionItemId;
import com.localfood.model.Comment;
import com.localfood.model.Favorite;
import com.localfood.model.FavoriteId;
import com.localfood.model.Follow;
import com.localfood.model.FollowId;
import com.localfood.model.Like;
import com.localfood.model.LikeId;
import com.localfood.model.Location;
import com.localfood.model.Notification;
import com.localfood.model.NotificationType;
import com.localfood.model.Post;
import com.localfood.model.PostImage;
import com.localfood.model.PostTag;
import com.localfood.model.PostTagId;
import com.localfood.model.Tag;
import com.localfood.model.User;
import com.localfood.repository.CheckinRepository;
import com.localfood.repository.CollectionItemRepository;
import com.localfood.repository.CollectionRepository;
import com.localfood.repository.CommentRepository;
import com.localfood.repository.FavoriteRepository;
import com.localfood.repository.FollowRepository;
import com.localfood.repository.LikeRepository;
import com.localfood.repository.LocationRepository;
import com.localfood.repository.NotificationRepository;
import com.localfood.repository.PostImageRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.PostTagRepository;
import com.localfood.repository.TagRepository;
import com.localfood.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SocialService {
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final TagRepository tagRepository;
    private final PostTagRepository postTagRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final FollowRepository followRepository;
    private final FavoriteRepository favoriteRepository;
    private final CheckinRepository checkinRepository;
    private final CollectionRepository collectionRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;

    public List<SocialDtos.PostResponse> getPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toPostResponse).toList();
    }

    public SocialDtos.PostResponse getPost(String postId) {
        return toPostResponse(requirePost(postId));
    }

    public SocialDtos.ProfileResponse getProfile(String userId, String viewerId) {
        User user = requireUser(userId);
        List<SocialDtos.PostResponse> posts = postRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toPostResponse)
                .toList();
        boolean followedByViewer = viewerId != null
                && !viewerId.isBlank()
                && !viewerId.equals(userId)
                && followRepository.existsById(new FollowId(viewerId, userId));

        return new SocialDtos.ProfileResponse(
                user.getId(),
                user.getUserName(),
                user.getAvatar(),
                user.getBio(),
                user.getCreatedAt(),
                posts.size(),
                followRepository.countByFollowing_Id(userId),
                followRepository.countByFollower_Id(userId),
                followedByViewer,
                posts);
    }

    @Transactional
    public SocialDtos.PostResponse createPost(SocialDtos.CreatePostRequest request) {
        User user = requireUser(request.userId());
        Location location = request.locationId() == null || request.locationId().isBlank()
                ? null : requireLocation(request.locationId());

        Post post = new Post();
        post.setUser(user);
        post.setLocation(location);
        post.setTitle(request.title().trim());
        post.setContent(request.content());
        post.setRating(request.rating());
        Post savedPost = postRepository.save(post);

        if (request.imageUrls() != null) {
            request.imageUrls().stream()
                    .filter(url -> url != null && !url.isBlank())
                    .distinct()
                    .forEach(url -> {
                        PostImage image = new PostImage();
                        image.setPost(savedPost);
                        image.setImageUrl(url.trim());
                        postImageRepository.save(image);
                    });
        }

        if (request.tags() != null) {
            request.tags().stream()
                    .filter(name -> name != null && !name.isBlank())
                    .map(this::normalizeTag)
                    .distinct()
                    .forEach(name -> attachTag(savedPost, name));
        }
        return toPostResponse(savedPost);
    }

    @Transactional
    public void deletePost(String postId, String userId) {
        Post post = requirePost(postId);
        if (!post.getUser().getId().equals(userId)) {
            throw new AppException("Bạn không có quyền xóa bài viết này");
        }
        postRepository.delete(post);
    }

    public List<SocialDtos.CommentResponse> getComments(String postId) {
        requirePost(postId);
        return commentRepository.findByPost_IdOrderByCreatedAtAsc(postId).stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @Transactional
    public SocialDtos.CommentResponse addComment(String postId, SocialDtos.CreateCommentRequest request) {
        Post post = requirePost(postId);
        User author = requireUser(request.userId());
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(author);
        comment.setContent(request.content().trim());
        Comment saved = commentRepository.save(comment);
        createNotification(post.getUser(), NotificationType.COMMENT, postId, author);
        return toCommentResponse(saved);
    }

    @Transactional
    public SocialDtos.ActionResponse toggleLike(String postId, String userId) {
        Post post = requirePost(postId);
        User user = requireUser(userId);
        LikeId id = new LikeId(userId, postId);
        if (likeRepository.existsById(id)) {
            likeRepository.deleteById(id);
            return new SocialDtos.ActionResponse(false);
        }
        Like like = new Like();
        like.setId(id);
        like.setUser(user);
        like.setPost(post);
        likeRepository.save(like);
        createNotification(post.getUser(), NotificationType.LIKE_POST, postId, user);
        return new SocialDtos.ActionResponse(true);
    }

    @Transactional
    public SocialDtos.ActionResponse toggleFollow(SocialDtos.FollowRequest request) {
        if (request.followerId().equals(request.followingId())) {
            throw new AppException("Người dùng không thể tự theo dõi chính mình");
        }
        User follower = requireUser(request.followerId());
        User following = requireUser(request.followingId());
        FollowId id = new FollowId(follower.getId(), following.getId());
        if (followRepository.existsById(id)) {
            followRepository.deleteById(id);
            return new SocialDtos.ActionResponse(false);
        }
        Follow follow = new Follow();
        follow.setId(id);
        follow.setFollower(follower);
        follow.setFollowing(following);
        followRepository.save(follow);
        createNotification(following, NotificationType.FOLLOW, follower.getId(), follower);
        return new SocialDtos.ActionResponse(true);
    }

    @Transactional
    public SocialDtos.ActionResponse toggleFavorite(SocialDtos.FavoriteRequest request) {
        User user = requireUser(request.userId());
        Location location = requireLocation(request.locationId());
        FavoriteId id = new FavoriteId(user.getId(), location.getId());
        if (favoriteRepository.existsById(id)) {
            favoriteRepository.deleteById(id);
            return new SocialDtos.ActionResponse(false);
        }
        Favorite favorite = new Favorite();
        favorite.setId(id);
        favorite.setUser(user);
        favorite.setLocation(location);
        favoriteRepository.save(favorite);
        return new SocialDtos.ActionResponse(true);
    }

    public List<SocialDtos.FavoriteResponse> getFavorites(String userId) {
        requireUser(userId);
        return favoriteRepository.findByUser_Id(userId).stream()
                .map(item -> new SocialDtos.FavoriteResponse(userId, toLocationSummary(item.getLocation())))
                .toList();
    }

    @Transactional
    public SocialDtos.CheckinResponse checkin(SocialDtos.CheckinRequest request) {
        User user = requireUser(request.userId());
        Location location = requireLocation(request.locationId());
        Checkin checkin = new Checkin();
        checkin.setUser(user);
        checkin.setLocation(location);
        Checkin saved = checkinRepository.save(checkin);
        return new SocialDtos.CheckinResponse(user.getId(), toLocationSummary(location), saved.getId().getTime());
    }

    public List<SocialDtos.CheckinResponse> getCheckins(String userId) {
        requireUser(userId);
        return checkinRepository.findByUser_IdOrderById_TimeDesc(userId).stream()
                .map(item -> new SocialDtos.CheckinResponse(
                        userId, toLocationSummary(item.getLocation()), item.getId().getTime()))
                .toList();
    }

    @Transactional
    public SocialDtos.CollectionResponse createCollection(SocialDtos.CreateCollectionRequest request) {
        Collection collection = new Collection();
        collection.setUser(requireUser(request.userId()));
        collection.setTitle(request.title().trim());
        return toCollectionResponse(collectionRepository.save(collection));
    }

    public List<SocialDtos.CollectionResponse> getCollections(String userId) {
        requireUser(userId);
        return collectionRepository.findByUser_Id(userId).stream().map(this::toCollectionResponse).toList();
    }

    @Transactional
    public SocialDtos.CollectionResponse addCollectionItem(
            String collectionId, SocialDtos.AddCollectionItemRequest request) {
        Collection collection = requireCollection(collectionId);
        Location location = requireLocation(request.locationId());
        CollectionItemId id = new CollectionItemId(collectionId, location.getId());
        if (!collectionItemRepository.existsById(id)) {
            CollectionItem item = new CollectionItem();
            item.setId(id);
            item.setCollection(collection);
            item.setLocation(location);
            collectionItemRepository.save(item);
        }
        return toCollectionResponse(collection);
    }

    public List<SocialDtos.NotificationResponse> getNotifications(String userId) {
        requireUser(userId);
        return notificationRepository.findByReceiver_IdOrderByCreatedAtDesc(userId).stream()
                .map(this::toNotificationResponse)
                .toList();
    }

    @Transactional
    public SocialDtos.NotificationResponse markNotificationRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException("Không tìm thấy thông báo"));
        if (!notification.getReceiver().getId().equals(userId)) {
            throw new AppException("Bạn không có quyền cập nhật thông báo này");
        }
        notification.setRead(true);
        return toNotificationResponse(notificationRepository.save(notification));
    }

    private void attachTag(Post post, String name) {
        Tag tag = tagRepository.findByName(name).orElseGet(() -> {
            Tag created = new Tag();
            created.setName(name);
            return tagRepository.save(created);
        });
        PostTagId id = new PostTagId(post.getId(), tag.getId());
        if (!postTagRepository.existsById(id)) {
            PostTag postTag = new PostTag();
            postTag.setId(id);
            postTag.setPost(post);
            postTag.setTag(tag);
            postTagRepository.save(postTag);
        }
    }

    private void createNotification(User receiver, NotificationType type, String referenceId, User actor) {
        if (receiver.getId().equals(actor.getId())) {
            return;
        }
        Notification notification = new Notification();
        notification.setReceiver(receiver);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notificationRepository.save(notification);
    }

    private SocialDtos.PostResponse toPostResponse(Post post) {
        List<String> images = postImageRepository.findByPost_Id(post.getId()).stream()
                .map(PostImage::getImageUrl).toList();
        List<String> tags = postTagRepository.findByPost_Id(post.getId()).stream()
                .map(postTag -> postTag.getTag().getName()).toList();
        return new SocialDtos.PostResponse(
                post.getId(),
                toUserSummary(post.getUser()),
                post.getLocation() == null ? null : toLocationSummary(post.getLocation()),
                post.getTitle(),
                post.getContent(),
                post.getRating(),
                post.getCreatedAt(),
                images,
                tags,
                likeRepository.countByPost_Id(post.getId()),
                commentRepository.countByPost_Id(post.getId()));
    }

    private SocialDtos.CommentResponse toCommentResponse(Comment comment) {
        return new SocialDtos.CommentResponse(
                comment.getId(), toUserSummary(comment.getUser()), comment.getContent(), comment.getCreatedAt());
    }

    private SocialDtos.CollectionResponse toCollectionResponse(Collection collection) {
        List<SocialDtos.LocationSummary> locations =
                collectionItemRepository.findByCollection_Id(collection.getId()).stream()
                        .map(item -> toLocationSummary(item.getLocation()))
                        .toList();
        return new SocialDtos.CollectionResponse(
                collection.getId(), collection.getTitle(), collection.getUser().getId(), locations);
    }

    private SocialDtos.NotificationResponse toNotificationResponse(Notification notification) {
        return new SocialDtos.NotificationResponse(
                notification.getId(), notification.getType(), notification.getReferenceId(),
                notification.isRead(), notification.getCreatedAt());
    }

    private SocialDtos.UserSummary toUserSummary(User user) {
        return new SocialDtos.UserSummary(user.getId(), user.getUserName(), user.getAvatar());
    }

    private SocialDtos.LocationSummary toLocationSummary(Location location) {
        return new SocialDtos.LocationSummary(location.getId(), location.getName(), location.getAddress());
    }

    private String normalizeTag(String value) {
        String normalized = value.trim();
        return normalized.startsWith("#") ? normalized.substring(1) : normalized;
    }

    private User requireUser(String id) {
        return userRepository.findById(id).orElseThrow(() -> new AppException("Không tìm thấy người dùng"));
    }

    private Location requireLocation(String id) {
        return locationRepository.findById(id).orElseThrow(() -> new AppException("Không tìm thấy địa điểm"));
    }

    private Post requirePost(String id) {
        return postRepository.findById(id).orElseThrow(() -> new AppException("Không tìm thấy bài viết"));
    }

    private Collection requireCollection(String id) {
        return collectionRepository.findById(id).orElseThrow(() -> new AppException("Không tìm thấy bộ sưu tập"));
    }
}