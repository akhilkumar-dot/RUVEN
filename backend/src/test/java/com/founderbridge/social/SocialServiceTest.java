package com.founderbridge.social;

import com.founderbridge.auth.domain.*;
import com.founderbridge.social.domain.*;
import com.founderbridge.social.service.SocialService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SocialServiceTest {

    @Mock PostRepository      postRepository;
    @Mock PostLikeRepository  postLikeRepository;
    @Mock ConnectionRepository connectionRepository;
    @Mock UserRepository      userRepository;

    @InjectMocks SocialService socialService;

    private User mockUser(String handle) {
        return User.builder()
            .id(UUID.randomUUID()).userHandle(handle).email(handle + "@test.in")
            .type(User.AccountType.INDIVIDUAL).role(User.Role.USER)
            .build();
    }

    @Test
    @DisplayName("createPost — saves post with correct author and body")
    void createPost_savesCorrectly() {
        User author = mockUser("aarav1234");
        when(userRepository.findById(author.getId())).thenReturn(Optional.of(author));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Post post = socialService.createPost(author.getId(), "Hello FounderBridge!", Post.PostVisibility.PUBLIC);

        assertThat(post.getBody()).isEqualTo("Hello FounderBridge!");
        assertThat(post.getAuthor().getUserHandle()).isEqualTo("aarav1234");
        assertThat(post.getVisibility()).isEqualTo(Post.PostVisibility.PUBLIC);
        verify(postRepository).save(any(Post.class));
    }

    @Test
    @DisplayName("toggleLike — first like increments likeCount")
    void toggleLike_firstLike_incrementsCount() {
        User user = mockUser("priya");
        Post post = Post.builder()
            .id(UUID.randomUUID()).author(user).body("test").likeCount(5).build();

        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(postLikeRepository.findByPostIdAndUserId(post.getId(), user.getId()))
            .thenReturn(Optional.empty());
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(postLikeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean liked = socialService.toggleLike(user.getId(), post.getId());

        assertThat(liked).isTrue();
        assertThat(post.getLikeCount()).isEqualTo(6);
    }

    @Test
    @DisplayName("toggleLike — unlike decrements likeCount")
    void toggleLike_unlike_decrementsCount() {
        User user = mockUser("priya");
        Post post = Post.builder()
            .id(UUID.randomUUID()).author(user).body("test").likeCount(10).build();
        PostLike existing = PostLike.builder().post(post).user(user).build();

        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(postLikeRepository.findByPostIdAndUserId(post.getId(), user.getId()))
            .thenReturn(Optional.of(existing));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean liked = socialService.toggleLike(user.getId(), post.getId());

        assertThat(liked).isFalse();
        assertThat(post.getLikeCount()).isEqualTo(9);
    }

    @Test
    @DisplayName("sendRequest — self-connect throws 400")
    void sendRequest_selfConnect_throws400() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> socialService.sendRequest(userId, userId, null))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(e -> ((ResponseStatusException)e).getStatusCode().value())
            .isEqualTo(400);
    }

    @Test
    @DisplayName("sendRequest — duplicate connection throws 409")
    void sendRequest_duplicate_throws409() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        Connection existing = Connection.builder().build();

        when(connectionRepository.findBetween(a, b)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> socialService.sendRequest(a, b, null))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(e -> ((ResponseStatusException)e).getStatusCode().value())
            .isEqualTo(409);
    }

    @Test
    @DisplayName("deletePost — non-owner throws 403")
    void deletePost_nonOwner_throws403() {
        User owner  = mockUser("owner");
        User other  = mockUser("other");
        Post post   = Post.builder().id(UUID.randomUUID()).author(owner).body("body").build();

        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> socialService.deletePost(other.getId(), post.getId()))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(e -> ((ResponseStatusException)e).getStatusCode().value())
            .isEqualTo(403);
    }
}
