package com.dsavisualizer.service;


import com.dsavisualizer.dto.Judge0Result;
import com.dsavisualizer.dto.Judge0SubmissionRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


import java.util.Map;

@Service
public class Judge0Service {

    private final WebClient webClient;

    public Judge0Service(
            WebClient.Builder webClientBuilder,
            @Value("${judge0.api.url}") String judge0ApiUrl,
            @Value("${judge0.api.key:}") String judge0ApiKey,
            @Value("${judge0.api.host:judge0-ce.p.rapidapi.com}") String judge0ApiHost) {
        WebClient.Builder authenticatedBuilder = webClientBuilder.baseUrl(judge0ApiUrl);

        // RapidAPI credentials are optional so local/self-hosted Judge0 remains supported.
        if (!judge0ApiKey.isBlank()) {
            authenticatedBuilder.defaultHeader("X-RapidAPI-Key", judge0ApiKey);
            if (!judge0ApiHost.isBlank()) {
                authenticatedBuilder.defaultHeader("X-RapidAPI-Host", judge0ApiHost);
            }
        }

        this.webClient = authenticatedBuilder.build();
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
                .bodyToMono(Judge0Result.class);
    }


    public int getLanguageId(String language) {
        return LANGUAGE_MAP.getOrDefault(language.toLowerCase(), 0);
    }
}
