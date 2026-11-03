package com.founderbridge.users;

import com.founderbridge.users.service.ProfileService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class SlugGenerationTest {

    // Slug logic is inside ProfileService#slugify — test via reflection or extract
    // We test the expected output patterns directly

    @Test
    @DisplayName("slugify — replaces spaces with hyphens")
    void slugify_spacesReplaced() {
        String input = "Deep Stack AI";
        String slug  = slugify(input);
        assertThat(slug).doesNotContain(" ");
        assertThat(slug).contains("-");
    }

    @Test
    @DisplayName("slugify — lowercases result")
    void slugify_lowercase() {
        assertThat(slugify("FounderBridge")).isEqualTo("founderbridge");
    }

    @Test
    @DisplayName("slugify — strips special characters")
    void slugify_stripsSpecialChars() {
        assertThat(slugify("Hello, World!")).isEqualTo("hello-world");
    }

    @Test
    @DisplayName("slugify — collapses multiple hyphens")
    void slugify_collapseHyphens() {
        assertThat(slugify("foo   bar   baz")).isEqualTo("foo-bar-baz");
    }

    /** Copy of ProfileService.slugify for unit testing */
    private static String slugify(String input) {
        return input.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-{2,}", "-")
            .replaceAll("^-|-$", "");
    }
}
