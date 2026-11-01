package com.founderbridge.auth.service;

import com.founderbridge.auth.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class UserHandleGenerator {

    private final UserRepository userRepository;

    /**
     * Generate a unique user handle of the form: firstName + 4-digit random suffix.
     * Collisions are retried up to 10 times before using a longer random suffix.
     * e.g. "aarav1234", "priya5678"
     */
    public String generate(String fullName) {
        String base = toBase(fullName);
        for (int attempt = 0; attempt < 10; attempt++) {
            int suffix = ThreadLocalRandom.current().nextInt(1000, 9999);
            String handle = base + suffix;
            if (!userRepository.existsByUserHandleIgnoreCase(handle)) {
                return handle;
            }
        }
        // Fallback: base + 8-digit random
        return base + ThreadLocalRandom.current().nextInt(10_000_000, 99_999_999);
    }

    private String toBase(String fullName) {
        if (fullName == null || fullName.isBlank()) return "user";
        return fullName.trim()
                .split("\\s+")[0]           // first word only
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "") // strip non-alphanumeric
                .substring(0, Math.min(12, fullName.split("\\s+")[0].replaceAll("[^a-zA-Z0-9]", "").length()));
    }
}
