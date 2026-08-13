package com.fitness.userservice;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = UserserviceApplication.class)
class UserserviceApplicationTests {

	@Test
	@DisplayName("User Service spring context loads successfully")
	void contextLoads() {
		assertTrue(true, "User Service spring context initialized");
	}
}

