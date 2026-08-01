package com.dsavisualizer.service;

import com.dsavisualizer.dto.ProfileUpdateRequest;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.ForgotPasswordRepository;
import com.dsavisualizer.repository.UserProgressRepository;
import com.dsavisualizer.repository.UserRepository;
import com.dsavisualizer.repository.UserSolutionRepository;
import com.dsavisualizer.repository.VerificationTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceProfileTest {
    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock UserProgressRepository userProgressRepository;
    @Mock UserSolutionRepository userSolutionRepository;
    @Mock ForgotPasswordRepository forgotPasswordRepository;
    @Mock VerificationTokenRepository verificationTokenRepository;

    @Test
    void profileUpdateTrimsAndPersistsNames() {
        User user = new User("user-1", "learner@example.com", "hash", "Ada", "Lovelace");
        when(userRepository.save(user)).thenReturn(user);
        UserService service = service();

        User result = service.updateProfile(user,
                new ProfileUpdateRequest("  Grace ", " Hopper ", "LEARNER@example.com"));

        assertThat(result.getFirstName()).isEqualTo("Grace");
        assertThat(result.getLastName()).isEqualTo("Hopper");
        assertThat(result.getEmail()).isEqualTo("learner@example.com");
        verify(userRepository).save(user);
    }

    @Test
    void profileEmailChangeIsRejectedUntilVerified() {
        User user = new User("user-1", "learner@example.com", "hash", "Ada", "Lovelace");

        assertThatThrownBy(() -> service().updateProfile(user,
                new ProfileUpdateRequest("Ada", "Lovelace", "new@example.com")))
                .isInstanceOf(EmailVerificationRequiredException.class);
        verify(userRepository, never()).save(any(User.class));
    }

    private UserService service() {
        return new UserService(userRepository, passwordEncoder, userProgressRepository,
                userSolutionRepository, forgotPasswordRepository, verificationTokenRepository);
    }
}
