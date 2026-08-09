package com.crm.module.auth.service;

import com.crm.common.exception.AuthenticationException;
import com.crm.module.auth.dto.TokenResponse;
import com.crm.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Validates a Google ID token via the tokeninfo endpoint and either logs in
 * or registers the user, returning a fresh token pair.
 *
 * Satisfies: Requirements 3.1–3.4
 */
@Service
public class GoogleOAuthService {

    private static final String TOKENINFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";

    private final UserRepository userRepository;
    private final AuthService authService;

    public GoogleOAuthService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    private final RestClient restClient = RestClient.create();

    /**
     * Authenticates (or registers) a user via their Google ID token.
     *
     * @param idToken the raw Google ID token from the client
     * @return a fresh {@link TokenResponse} (access + refresh tokens)
     */
    @SuppressWarnings("unchecked")
    public TokenResponse authenticate(String idToken) {
        // 1. Call Google tokeninfo endpoint
        ResponseEntity<Map> response;
        try {
            response = restClient.get()
                    .uri(TOKENINFO_URL, idToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (Exception e) {
            throw new AuthenticationException("Invalid or expired Google token");
        }

        // 2. Validate response
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new AuthenticationException("Invalid or expired Google token");
        }

        Map<String, Object> claims = response.getBody();
        String email = (String) claims.get("email");
        if (email == null || email.isBlank()) {
            throw new AuthenticationException("Invalid or expired Google token");
        }

        // 3. Extract name (fall back to email prefix)
        String name = (String) claims.get("name");
        if (name == null || name.isBlank()) {
            name = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        }

        // 4. Login or register
        if (userRepository.existsByEmail(email)) {
            return authService.loginWithGoogle(email);
        } else {
            return authService.registerWithGoogle(email, name);
        }
    }
}
