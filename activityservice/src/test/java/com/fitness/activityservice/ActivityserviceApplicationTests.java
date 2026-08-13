package com.fitness.activityservice;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = ActivityserviceApplication.class)
class ActivityserviceApplicationTests {

	@Test
	@DisplayName("Activity Service spring context loads successfully")
	void contextLoads() {
		assertTrue(true, "Activity Service spring context initialized");
	}
}

