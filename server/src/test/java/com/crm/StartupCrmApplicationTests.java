package com.crm;

import com.crm.module.auth.service.GoogleOAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test: verifies the Spring application context loads correctly
 * without requiring external infrastructure (PostgreSQL, Redis, Flyway).
 *
 * Uses H2 in-memory database so JPA repositories wire up correctly.
 * Only external HTTP clients (GoogleOAuthService) are mocked.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.autoconfigure.exclude=" +
                "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration," +
                "org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration," +
                "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration," +
                "org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration",
        "spring.flyway.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class StartupCrmApplicationTests {

    // GoogleOAuthService makes external HTTP calls — mock it
    @MockBean
    GoogleOAuthService googleOAuthService;

    @Test
    void contextLoads() {
    }

}
