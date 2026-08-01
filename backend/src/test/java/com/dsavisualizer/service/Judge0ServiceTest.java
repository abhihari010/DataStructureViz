package com.dsavisualizer.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dsavisualizer.dto.Judge0Result;
import com.dsavisualizer.dto.Judge0SubmissionRequest;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

class Judge0ServiceTest {

    private HttpServer server;

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.start();
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    @Test
    void submitAndWaitSendsRapidApiHeadersAndJudge0Request() {
        AtomicReference<String> apiKey = new AtomicReference<>();
        AtomicReference<String> apiHost = new AtomicReference<>();
        AtomicReference<String> requestPath = new AtomicReference<>();

        server.createContext("/submissions", exchange -> {
            apiKey.set(exchange.getRequestHeaders().getFirst("X-RapidAPI-Key"));
            apiHost.set(exchange.getRequestHeaders().getFirst("X-RapidAPI-Host"));
            requestPath.set(exchange.getRequestURI().toString());
            exchange.getRequestBody().readAllBytes();

            byte[] response = """
                    {
                      "status": {"id": 3, "description": "Accepted"},
                      "stdout": "42\\n",
                      "time": 0.01,
                      "memory": 1024
                    }
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream output = exchange.getResponseBody()) {
                output.write(response);
            }
        });

        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        Judge0Service service = new Judge0Service(
                WebClient.builder(),
                baseUrl,
                "test-rapid-api-key",
                "judge0-ce.p.rapidapi.com");

        Judge0Result result = service.submitAndWait(
                        new Judge0SubmissionRequest("print(42)", 71, ""))
                .block(Duration.ofSeconds(5));

        assertThat(apiKey).hasValue("test-rapid-api-key");
        assertThat(apiHost).hasValue("judge0-ce.p.rapidapi.com");
        assertThat(requestPath).hasValue("/submissions?base64_encoded=false&wait=true");
        assertThat(result).isNotNull();
        assertThat(result.status().id()).isEqualTo(3);
        assertThat(result.stdout()).isEqualTo("42\n");
    }

    @Test
    void providerQuotaIsTypedAndDoesNotExposeProviderResponseBody() {
        server.createContext("/submissions", exchange -> {
            byte[] response = "provider-secret-and-rapidapi-key".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(429, response.length);
            try (OutputStream output = exchange.getResponseBody()) {
                output.write(response);
            }
        });

        Judge0Service service = service(Duration.ofSeconds(5));

        assertThatThrownBy(() -> service.submitAndWait(new Judge0SubmissionRequest("print(42)", 71, ""))
                .block(Duration.ofSeconds(2)))
                .isInstanceOf(Judge0ProviderException.class)
                .satisfies(error -> assertThat(((Judge0ProviderException) error).getFailureType())
                        .isEqualTo(com.dsavisualizer.dto.Judge0FailureType.QUOTA))
                .hasMessage("QUOTA");
    }

    @Test
    void providerTimeoutIsBoundedAndTyped() {
        server.createContext("/submissions", exchange -> {
            try {
                Thread.sleep(250);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
        });

        Judge0Service service = service(Duration.ofMillis(40));

        assertThatThrownBy(() -> service.submitAndWait(new Judge0SubmissionRequest("print(42)", 71, ""))
                .block(Duration.ofSeconds(2)))
                .isInstanceOf(Judge0ProviderException.class)
                .satisfies(error -> assertThat(((Judge0ProviderException) error).getFailureType())
                        .isEqualTo(com.dsavisualizer.dto.Judge0FailureType.TIMEOUT));
    }

    private Judge0Service service(Duration timeout) {
        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        return new Judge0Service(WebClient.builder(), baseUrl, "test-rapid-api-key",
                "judge0-ce.p.rapidapi.com", timeout);
    }
}
