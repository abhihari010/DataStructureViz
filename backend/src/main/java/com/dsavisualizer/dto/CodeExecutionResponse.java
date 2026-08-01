package com.dsavisualizer.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Setter
@Getter
public class CodeExecutionResponse {
    private String contractVersion = "v1";
    private ExecutionReceipt receipt;
    private ExecutionStatus status;
    private String failureCode;
    private boolean success;
    private List<TestCaseResult> testCaseResults;
    private boolean passed;
    private Object expectedOutput;
    private Double runtime; // in seconds
    private Integer memory; // in KB
    private String error;

    public CodeExecutionResponse() {
    }

    public CodeExecutionResponse(boolean success, List<TestCaseResult> testCaseResults, boolean passed,
                                 Object expectedOutput, Double runtime, Integer memory) {
        this("v1", null, success ? ExecutionStatus.ACCEPTED : ExecutionStatus.INTERNAL_ERROR,
                success ? null : "INTERNAL_ERROR", success, testCaseResults, passed, expectedOutput, runtime, memory,
                success ? null : "Execution failed");
    }

    public CodeExecutionResponse(String contractVersion, ExecutionReceipt receipt, ExecutionStatus status,
                                 String failureCode, boolean success, List<TestCaseResult> testCaseResults,
                                 boolean passed, Object expectedOutput, Double runtime, Integer memory, String error) {
        this.contractVersion = contractVersion;
        this.receipt = receipt;
        this.status = status;
        this.failureCode = failureCode;
        this.success = success;
        this.testCaseResults = testCaseResults;
        this.passed = passed;
        this.expectedOutput = expectedOutput;
        this.runtime = runtime;
        this.memory = memory;
        this.error = error;
    }

    public static CodeExecutionResponse failure(ExecutionStatus status, String message) {
        return new CodeExecutionResponse("v1", null, status, status.name(), false, List.of(), false,
                null, 0.0, 0, message);
    }

    @JsonProperty("results")
    public List<TestCaseResult> getResults() {
        return testCaseResults;
    }

    @JsonProperty("message")
    public String getMessage() {
        return error;
    }

    @JsonIgnore
    public boolean isProviderFailure() {
        return status == ExecutionStatus.PROVIDER_ERROR || status == ExecutionStatus.PROVIDER_QUOTA;
    }

    public String getContractVersion() { return contractVersion; }
    public ExecutionReceipt getReceipt() { return receipt; }
    public ExecutionStatus getStatus() { return status; }
    public String getFailureCode() { return failureCode; }
    public boolean isSuccess() { return success; }
    public List<TestCaseResult> getTestCaseResults() { return testCaseResults; }
    public boolean isPassed() { return passed; }
    public Object getExpectedOutput() { return expectedOutput; }
    public Double getRuntime() { return runtime; }
    public Integer getMemory() { return memory; }
    public String getError() { return error; }

    public void setContractVersion(String contractVersion) { this.contractVersion = contractVersion; }
    public void setReceipt(ExecutionReceipt receipt) { this.receipt = receipt; }
    public void setStatus(ExecutionStatus status) { this.status = status; }
    public void setFailureCode(String failureCode) { this.failureCode = failureCode; }
    public void setSuccess(boolean success) { this.success = success; }
    public void setTestCaseResults(List<TestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }
    public void setPassed(boolean passed) { this.passed = passed; }
    public void setExpectedOutput(Object expectedOutput) { this.expectedOutput = expectedOutput; }
    public void setRuntime(Double runtime) { this.runtime = runtime; }
    public void setMemory(Integer memory) { this.memory = memory; }
    public void setError(String error) { this.error = error; }


}
