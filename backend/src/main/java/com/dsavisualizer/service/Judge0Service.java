package com.dsavisualizer.service;


import com.dsavisualizer.dto.Judge0Result;
import com.dsavisualizer.dto.Judge0SubmissionRequest;
import com.dsavisualizer.dto.Judge0SubmissionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


import java.util.Map;

@Service
public class Judge0Service {

    private final WebClient webClient;

    public Judge0Service(WebClient.Builder webClientBuilder, @Value("${judge0.api.url}") String judge0ApiUrl) {
        this.webClient = webClientBuilder.baseUrl(judge0ApiUrl).build();
    }

    private static final Map<String, Integer> LANGUAGE_MAP = Map.of(
            "java", 62,
            "python", 71,
            "javascript", 63,
            "c++", 54
    );

    public Mono<Judge0Result> submitAndWait(Judge0SubmissionRequest req) {
        return webClient.post()
                .uri("/submissions?base64_encoded=false&wait=true")   // ⚠️ wait=true on POST
                .bodyValue(req)
                .retrieve()
                .bodyToMono(Judge0Result.class);
    }


    public int getLanguageId(String language) {
        return LANGUAGE_MAP.getOrDefault(language.toLowerCase(), 0);
    }
}
