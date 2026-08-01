package com.dsavisualizer.controller;

import com.dsavisualizer.dto.ProgressDraftRequest;
import com.dsavisualizer.dto.ProgressProblemResponse;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.service.UserProgressService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ProgressControllerTest {
    private final UserProgressService progressService = mock(UserProgressService.class);
    private final ProgressController controller = new ProgressController(progressService);
    private final User user = new User("owner", "owner@example.com", "hash", "Owner", "User");

    @Test
    void problemReadsUseTheAuthenticatedOwnerAndDoNotAcceptAUserId() {
        when(progressService.getProblemProgress("owner")).thenReturn(List.of());

        var response = controller.getProblemProgress(authenticationFor(user));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(progressService).getProblemProgress("owner");
        verifyNoMoreInteractions(progressService);
    }

    @Test
    void draftWriteIsScopedToTheAuthenticatedOwner() {
        ProgressProblemResponse saved = new ProgressProblemResponse(7L, "Two Sum", "easy", "array",
                "IN_PROGRESS", false, "draft", "python", 4, null, null, null, 0, null, null, null);
        when(progressService.saveDraft(eq(user), eq(7L), any())).thenReturn(saved);

        var response = controller.saveDraft(7L, new ProgressDraftRequest("draft", "python", 4),
                authenticationFor(user));

        assertThat(response.getBody()).isSameAs(saved);
        verify(progressService).saveDraft(eq(user), eq(7L), any(ProgressDraftRequest.class));
    }

    @Test
    void unauthenticatedPrincipalCannotReadOrWriteProgress() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn("owner@example.com");

        assertThatThrownBy(() -> controller.getProblemProgress(authentication))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                .hasMessageContaining("Authentication is required");
        verifyNoInteractions(progressService);
    }

    private Authentication authenticationFor(User principal) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        return authentication;
    }
}
