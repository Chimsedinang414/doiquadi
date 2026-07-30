package com.localfood.service;

import com.localfood.dto.SocialDtos;
import com.localfood.model.Follow;
import com.localfood.model.FollowId;
import com.localfood.model.User;
import com.localfood.repository.FollowRepository;
import com.localfood.repository.NotificationRepository;
import com.localfood.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocialServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private SocialService socialService;

    @Test
    void searchUsersReturnsPublicAccountDataAndFollowState() {
        User viewer = user("viewer-id", "viewer", "Người xem");
        User resultUser = user("result-id", "an.nguyen", "An Nguyễn");
        when(userRepository.findByAuthSubject("viewer-subject")).thenReturn(Optional.of(viewer));
        when(userRepository.searchDiscoverableUsers(
                eq("%an%"), eq("an"), eq("an%"), eq("viewer-id"), any(Pageable.class)))
                .thenReturn(List.of(resultUser));
        when(followRepository.existsById(new FollowId("viewer-id", "result-id"))).thenReturn(true);

        List<SocialDtos.AccountSearchResponse> results =
                socialService.searchUsers("  An  ", "viewer-subject");

        assertEquals(1, results.size());
        assertEquals("an.nguyen", results.get(0).userName());
        assertEquals("An Nguyễn", results.get(0).fullName());
        assertTrue(results.get(0).followedByViewer());
    }

    @Test
    void toggleFollowUsesAuthenticatedUserAsFollower() {
        User viewer = user("viewer-id", "viewer", "Người xem");
        User target = user("target-id", "target", "Người được theo dõi");
        FollowId expectedId = new FollowId("viewer-id", "target-id");
        when(userRepository.findByAuthSubject("viewer-subject")).thenReturn(Optional.of(viewer));
        when(userRepository.findById("target-id")).thenReturn(Optional.of(target));
        when(followRepository.existsById(expectedId)).thenReturn(false);

        SocialDtos.ActionResponse response = socialService.toggleFollow(
                "viewer-subject", new SocialDtos.FollowRequest("target-id"));

        assertTrue(response.active());
        ArgumentCaptor<Follow> followCaptor = ArgumentCaptor.forClass(Follow.class);
        verify(followRepository).save(followCaptor.capture());
        assertEquals(expectedId, followCaptor.getValue().getId());
        assertEquals(viewer, followCaptor.getValue().getFollower());
        assertEquals(target, followCaptor.getValue().getFollowing());
    }

    @Test
    void getFollowersReturnsInternalProfileDataAndViewerFollowState() {
        User viewer = user("viewer-id", "viewer", "Người xem");
        User follower = user("follower-id", "minh.nguyen", "Minh Nguyễn");
        when(userRepository.findById("profile-id")).thenReturn(Optional.of(user(
                "profile-id", "profile", "Chủ hồ sơ")));
        when(userRepository.findByAuthSubject("viewer-subject")).thenReturn(Optional.of(viewer));
        when(followRepository.findFollowers("profile-id")).thenReturn(List.of(follower));
        when(followRepository.existsById(new FollowId("viewer-id", "follower-id"))).thenReturn(true);

        List<SocialDtos.FollowUserResponse> results =
                socialService.getFollowers("profile-id", "viewer-subject");

        assertEquals(1, results.size());
        assertEquals("Minh Nguyễn", results.get(0).fullName());
        assertEquals("minh.nguyen", results.get(0).userName());
        assertTrue(results.get(0).followedByViewer());
    }

    @Test
    void getFollowingDoesNotMarkViewerAsFollowedByThemselves() {
        User viewer = user("viewer-id", "viewer", "Người xem");
        when(userRepository.findById("profile-id")).thenReturn(Optional.of(user(
                "profile-id", "profile", "Chủ hồ sơ")));
        when(userRepository.findByAuthSubject("viewer-subject")).thenReturn(Optional.of(viewer));
        when(followRepository.findFollowing("profile-id")).thenReturn(List.of(viewer));

        List<SocialDtos.FollowUserResponse> results =
                socialService.getFollowing("profile-id", "viewer-subject");

        assertEquals(1, results.size());
        assertEquals("viewer-id", results.get(0).id());
        assertEquals(false, results.get(0).followedByViewer());
    }

    private static User user(String id, String userName, String fullName) {
        User user = new User();
        user.setId(id);
        user.setAuthSubject(id.equals("viewer-id") ? "viewer-subject" : id + "-subject");
        user.setUserName(userName);
        user.setFullName(fullName);
        return user;
    }
}
