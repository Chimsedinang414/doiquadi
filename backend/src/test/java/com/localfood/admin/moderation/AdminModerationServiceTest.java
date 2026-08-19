package com.localfood.admin.moderation;

import com.localfood.admin.audit.AdminAuditLogRepository;
import com.localfood.admin.audit.AdminAuditService;
import com.localfood.admin.report.ReportRepository;
import com.localfood.model.ContentStatus;
import com.localfood.model.Post;
import com.localfood.model.PostImage;
import com.localfood.model.User;
import com.localfood.repository.CommentRepository;
import com.localfood.repository.FoodRepository;
import com.localfood.repository.LocationRepository;
import com.localfood.repository.PostRepository;
import com.localfood.repository.PostImageRepository;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminModerationServiceTest {
    @Test
    void deletingPostIsSoftDeleteAndCreatesAuditLog() {
        PostRepository postRepository = mock(PostRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        AdminAuditLogRepository auditRepository = mock(AdminAuditLogRepository.class);
        AdminModerationService service = new AdminModerationService(
                postRepository,
                mock(PostImageRepository.class),
                mock(CommentRepository.class),
                mock(LocationRepository.class),
                mock(FoodRepository.class),
                mock(ReportRepository.class),
                userRepository,
                new AdminAuditService(auditRepository));
        User actor = user("admin", "admin-subject");
        User author = user("author", "author-subject");
        Post post = new Post();
        post.setId("post-1");
        post.setUser(author);
        post.setTitle("Bài kiểm thử");
        post.setStatus(ContentStatus.ACTIVE);
        when(userRepository.findByAuthSubject(actor.getAuthSubject())).thenReturn(Optional.of(actor));
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));

        AdminPostResponse response = service.updatePostStatus(
                post.getId(), ContentStatus.DELETED, "Vi phạm nội dung", actor.getAuthSubject());

        assertThat(response.status()).isEqualTo(ContentStatus.DELETED);
        assertThat(post.getModerationReason()).isEqualTo("Vi phạm nội dung");
        verify(postRepository, never()).delete(post);
        verify(auditRepository).save(org.mockito.ArgumentMatchers.argThat(
                log -> "POST_DELETED".equals(log.getAction()) && "post-1".equals(log.getTargetId())));
    }

    @Test
    void postPreviewIncludesPostImages() {
        PostRepository postRepository = mock(PostRepository.class);
        PostImageRepository postImageRepository = mock(PostImageRepository.class);
        ReportRepository reportRepository = mock(ReportRepository.class);
        AdminModerationService service = new AdminModerationService(
                postRepository,
                postImageRepository,
                mock(CommentRepository.class),
                mock(LocationRepository.class),
                mock(FoodRepository.class),
                reportRepository,
                mock(UserRepository.class),
                new AdminAuditService(mock(AdminAuditLogRepository.class)));
        Post post = new Post();
        post.setId("post-with-images");
        post.setUser(user("author", "author-subject"));
        post.setTitle("Bài có ảnh");
        PostImage first = new PostImage();
        first.setImageUrl("https://cdn.example.com/first.jpg");
        PostImage second = new PostImage();
        second.setImageUrl("https://cdn.example.com/second.jpg");
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(postImageRepository.findByPost_Id(post.getId())).thenReturn(List.of(first, second));

        AdminPostResponse response = service.findPost(post.getId());

        assertThat(response.imageUrls()).containsExactly(
                "https://cdn.example.com/first.jpg", "https://cdn.example.com/second.jpg");
    }

    private static User user(String id, String subject) {
        User user = new User();
        user.setId(id);
        user.setAuthSubject(subject);
        user.setUserName(id);
        user.setEmail(id + "@example.com");
        return user;
    }
}
