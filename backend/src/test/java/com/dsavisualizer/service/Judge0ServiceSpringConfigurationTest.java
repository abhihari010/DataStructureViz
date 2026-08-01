package com.dsavisualizer.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.convert.ApplicationConversionService;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.test.context.support.TestPropertySourceUtils;
import org.springframework.web.reactive.function.client.WebClient;

class Judge0ServiceSpringConfigurationTest {

    @Test
    void springUsesTheConfiguredConstructorWhenTheServiceHasCompatibilityConstructors() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
            context.getBeanFactory().setConversionService(ApplicationConversionService.getSharedInstance());
            context.registerBean(WebClient.Builder.class, WebClient::builder);
            TestPropertySourceUtils.addInlinedPropertiesToEnvironment(
                    context,
                    "judge0.api.url=http://127.0.0.1:8080",
                    "judge0.api.key=test-key",
                    "judge0.api.host=judge0-ce.p.rapidapi.com",
                    "judge0.api.timeout=15s");
            context.register(Judge0Service.class);
            context.refresh();

            assertThat(context.getBean(Judge0Service.class)).isNotNull();
        }
    }
}
