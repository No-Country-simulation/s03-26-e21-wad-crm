package com.crm;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Full application context test — requires a running PostgreSQL instance.
 * Run with: mvn test -Dintegration.tests=true
 */
@SpringBootTest
@EnabledIfSystemProperty(named = "integration.tests", matches = "true")
class StartupCrmApplicationTests {

	@Test
	void contextLoads() {
	}

}
