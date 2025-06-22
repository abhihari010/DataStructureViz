package com.dsavisualizer.controller;

import com.dsavisualizer.dto.CodeExecutionRequest;
import com.dsavisualizer.dto.CodeExecutionResponse;
import com.dsavisualizer.service.CodeExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/execute")
public class CodeExecutionController {

    private final CodeExecutionService executionService;

    public CodeExecutionController(CodeExecutionService executionService) {
        this.executionService = executionService;
    }


    @PostMapping
    public ResponseEntity<CodeExecutionResponse> executeCode(@RequestBody CodeExecutionRequest request) {
        CodeExecutionResponse response = executionService.executeCode(request);
        return ResponseEntity.ok(response);
    }
}
