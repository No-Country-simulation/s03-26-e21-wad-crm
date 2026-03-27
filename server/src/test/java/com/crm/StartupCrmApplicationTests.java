package com.crm;

import com.crm.module.auth.service.GoogleOAuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

/**
 * Full application context test — requires a running PostgreSQL instance.
 * Run with: mvn test -Dintegration.tests=true
 */
@SpringBootTest
@EnabledIfSystemProperty(named = "integration.tests", matches = "true")
class StartupCrmApplicationTests {

    // GoogleOAuthService makes external HTTP calls — mock it
    @MockBean
    GoogleOAuthService googleOAuthService;

    @Test
    void contextLoads() {
    }

}
