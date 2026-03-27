package com.crm.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Extracts {@code workspaceId} and {@code role} from the JWT Bearer token
 * and injects them into {@link WorkspaceContext} before the request reaches
 * the controller. Clears the context in a finally block after the request.
 *
 * Satisfies: Requirements 7.1, 8.1, 8.2
 */
@Slf4j
@Component
public class WorkspaceFilter extends OncePerRequestFilter {

    private final String jwtSecret;

    public WorkspaceFilter(@Value("${app.jwt.secret}") String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractBearerToken(request);

        if (token != null) {
            try {
                Claims claims = Jwts.parser()
                        .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String workspaceIdStr = claims.get("workspaceId", String.class);
                String role = claims.get("role", String.class);

                if (StringUtils.hasText(workspaceIdStr)) {
                    WorkspaceContext.setWorkspaceId(UUID.fromString(workspaceIdStr));
                }
                if (StringUtils.hasText(role)) {
                    WorkspaceContext.setRole(role);
                }
            } catch (JwtException | IllegalArgumentException e) {
                log.debug("WorkspaceFilter: could not parse JWT claims — {}", e.getMessage());
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            WorkspaceContext.clear();
        }
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
