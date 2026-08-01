package com.dsavisualizer.service;


import com.dsavisualizer.dto.Judge0Result;
import com.dsavisualizer.dto.Judge0SubmissionRequest;
import com.dsavisualizer.dto.Judge0FailureType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
public class Judge0Service {

    private final WebClient webClient;
    private final Duration requestTimeout;

    public Judge0Service(
            WebClient.Builder webClientBuilder,
            @Value("${judge0.api.url}") String judge0ApiUrl,
            @Value("${judge0.api.key:}") String judge0ApiKey,
            @Value("${judge0.api.host:judge0-ce.p.rapidapi.com}") String judge0ApiHost,
            @Value("${judge0.api.timeout:15s}") Duration requestTimeout) {
        WebClient.Builder authenticatedBuilder = webClientBuilder.baseUrl(judge0ApiUrl);

        // RapidAPI credentials are optional so local/self-hosted Judge0 remains supported.
        if (!judge0ApiKey.isBlank()) {
            authenticatedBuilder.defaultHeader("X-RapidAPI-Key", judge0ApiKey);
            if (!judge0ApiHost.isBlank()) {
                authenticatedBuilder.defaultHeader("X-RapidAPI-Host", judge0ApiHost);
            }
        }

        this.webClient = authenticatedBuilder.build();
        this.requestTimeout = requestTimeout;
    }

    /** Compatibility constructor for local callers and focused tests. */
    public Judge0Service(WebClient.Builder webClientBuilder, String judge0ApiUrl,
                         String judge0ApiKey, String judge0ApiHost) {
        this(webClientBuilder, judge0ApiUrl, judge0ApiKey, judge0ApiHost, Duration.ofSeconds(15));
    }

    private static final Map<String, Integer> LANGUAGE_MAP = Map.of(
            "java", 62,
            "python", 71,
            "javascript", 63,
            "c++", 54,
            "cpp", 54
    );

    public Mono<Judge0Result> submitAndWait(Judge0SubmissionRequest req) {
        return webClient.post()
                .uri("/submissions?base64_encoded=false&wait=true")   // ⚠️ wait=true on POST
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
                .onStatus(status -> status.value() == 429,
                        response -> Mono.error(new Judge0ProviderException(Judge0FailureType.QUOTA)))
                .onStatus(status -> status.value() == 400 || status.value() == 401 || status.value() == 403,
                        response -> Mono.error(new Judge0ProviderException(Judge0FailureType.BAD_REQUEST)))
                .onStatus(status -> status.is5xxServerError() || status.value() == 408,
                        response -> Mono.error(new Judge0ProviderException(Judge0FailureType.UNAVAILABLE)))
                .bodyToMono(Judge0Result.class)
                .timeout(requestTimeout)
                .onErrorMap(TimeoutException.class,
                        ignored -> new Judge0ProviderException(Judge0FailureType.TIMEOUT))
                .onErrorMap(error -> !(error instanceof Judge0ProviderException),
                        error -> {
                            if (error instanceof WebClientResponseException responseException
                                    && responseException.getStatusCode().is5xxServerError()) {
                                return new Judge0ProviderException(Judge0FailureType.UNAVAILABLE);
                            }
                            return new Judge0ProviderException(Judge0FailureType.PROVIDER_ERROR);
                        });
    }


    public int getLanguageId(String language) {
        return LANGUAGE_MAP.getOrDefault(language.toLowerCase(), 0);
    }
}
