package com.fitness.aiservice;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = AiserviceApplication.class)
class AiserviceApplicationTests {

	@Test
	@DisplayName("AI Service LangChain4j and RAG context loads successfully")
	void contextLoads() {
		assertTrue(true, "AI Service spring context initialized");
	}
}

