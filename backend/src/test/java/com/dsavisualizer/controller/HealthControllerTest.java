package com.dsavisualizer.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {
    @Mock
    private DataSource dataSource;

    @Mock
    private Connection connection;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new HealthController(dataSource)).build();
    }

    @Test
    void livenessIsLightweightAndDoesNotRequireTheDatabase() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"status\":\"UP\"}"));

        verifyNoInteractions(dataSource);
    }

    @Test
    void readinessReportsDatabaseAndDegradedJudge0() throws Exception {
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(2)).thenReturn(true);

        mockMvc.perform(get("/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components.database.status").value("UP"))
                .andExpect(jsonPath("$.components.judge0.status").value("DEGRADED"));

        verify(connection).close();
    }

    @Test
    void readinessFailsWhenTheDatabaseIsUnavailableWithoutExposingConnectionDetails() throws Exception {
        when(dataSource.getConnection()).thenThrow(new SQLException("password=do-not-leak"));

        mockMvc.perform(get("/health/readiness"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("DOWN"))
                .andExpect(jsonPath("$.components.database.status").value("DOWN"))
                .andExpect(jsonPath("$.components.judge0.status").value("DEGRADED"))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("do-not-leak"))));
    }
}
