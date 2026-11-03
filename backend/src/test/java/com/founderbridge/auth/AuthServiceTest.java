package com.founderbridge.auth;

import com.founderbridge.AppConfig;
import com.founderbridge.auth.domain.*;
import com.founderbridge.auth.dto.*;
import com.founderbridge.auth.service.*;
import com.founderbridge.shared.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository            userRepository;
    @Mock RefreshTokenRepository    refreshTokenRepository;
    @Mock OneTimeTokenRepository    oneTimeTokenRepository;
    @Mock UserHandleGenerator       handleGenerator;
    @Mock CookieUtil                cookieUtil;
    @Mock AppConfig                 appConfig;
    @Mock AppConfig.JwtConfig       jwtConfig;
    @Mock JwtService                jwtService;
    @Mock HttpServletResponse       response;

    @InjectMocks AuthService authService;

    private final Argon2PasswordEncoder encoder =
        Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();

    @BeforeEach
    void setUp() {
        when(appConfig.jwt()).thenReturn(jwtConfig);
        when(jwtConfig.refreshExpiryDays()).thenReturn(30);
    }

    // ── Registration ──────────────────────────────────────────

    @Test
    @DisplayName("register — happy path creates user and returns tokens")
    void register_success() {
        var req = new RegisterRequest("Aarav Reddy", "aarav@test.in", "9876543210",
            "SecurePass1!", RegisterRequest.AccountType.INDIVIDUAL);

        when(userRepository.existsByEmailIgnoreCase("aarav@test.in")).thenReturn(false);
        when(handleGenerator.generate("Aarav Reddy")).thenReturn("aarav1234");
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u = User.builder()
                .id(UUID.randomUUID()).email(u.getEmail())
                .userHandle("aarav1234").passwordHash(u.getPasswordHash())
                .type(User.AccountType.INDIVIDUAL).build();
            return u;
        });
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateAccessToken(any(), any(), any())).thenReturn("access.token.here");
        when(jwtService.getAccessExpirySeconds()).thenReturn(900L);

        AuthResponse result = authService.register(req, response);

        assertThat(result.accessToken()).isEqualTo("access.token.here");
        assertThat(result.user().userHandle()).isEqualTo("aarav1234");
        verify(userRepository).save(any());
    }

    @Test
    @DisplayName("register — duplicate email throws 409 CONFLICT")
    void register_duplicateEmail_throws409() {
        var req = new RegisterRequest("Test User", "existing@test.in", "9876543210",
            "SecurePass1!", RegisterRequest.AccountType.INDIVIDUAL);
        when(userRepository.existsByEmailIgnoreCase("existing@test.in")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req, response))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(e -> ((ResponseStatusException) e).getStatusCode().value())
            .isEqualTo(409);
    }

    // ── Login ─────────────────────────────────────────────────

    @Test
    @DisplayName("login — correct credentials returns token")
    void login_success() {
        String rawPassword = "SecurePass1!";
        User user = User.builder()
            .id(UUID.randomUUID()).email("aarav@test.in").userHandle("aarav1234")
            .passwordHash(encoder.encode(rawPassword))
            .type(User.AccountType.INDIVIDUAL)
            .role(User.Role.USER).status(User.UserStatus.ACTIVE)
            .build();

        when(userRepository.findByEmailOrHandle("aarav@test.in")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateAccessToken(any(), any(), any())).thenReturn("token");
        when(jwtService.getAccessExpirySeconds()).thenReturn(900L);

        var req = new LoginRequest("aarav@test.in", rawPassword);
        AuthResponse result = authService.login(req, response, "Mozilla", "127.0.0.1");

        assertThat(result.accessToken()).isEqualTo("token");
    }

    @Test
    @DisplayName("login — wrong password throws 401 (generic message)")
    void login_wrongPassword_throws401() {
        User user = User.builder()
            .id(UUID.randomUUID()).email("aarav@test.in").userHandle("aarav1234")
            .passwordHash(encoder.encode("correct-password"))
            .type(User.AccountType.INDIVIDUAL)
            .role(User.Role.USER).status(User.UserStatus.ACTIVE)
            .build();

        when(userRepository.findByEmailOrHandle("aarav@test.in")).thenReturn(Optional.of(user));

        var req = new LoginRequest("aarav@test.in", "wrong-password");
        assertThatThrownBy(() -> authService.login(req, response, null, null))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(e -> ((ResponseStatusException) e).getStatusCode().value())
            .isEqualTo(401);
    }

    @Test
    @DisplayName("login — nonexistent user throws 401 (same message)")
    void login_unknownUser_throws401() {
        when(userRepository.findByEmailOrHandle(any())).thenReturn(Optional.empty());

        var req = new LoginRequest("nobody@test.in", "password");
        assertThatThrownBy(() -> authService.login(req, response, null, null))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(e -> ((ResponseStatusException) e).getStatusCode().value())
            .isEqualTo(401);
    }

    // ── SHA-256 helper ────────────────────────────────────────

    @Test
    @DisplayName("sha256 — deterministic and non-null")
    void sha256_deterministic() {
        String hash1 = AuthService.sha256("test-token");
        String hash2 = AuthService.sha256("test-token");
        assertThat(hash1).isEqualTo(hash2).hasSize(64).matches("[0-9a-f]+");
    }
}
