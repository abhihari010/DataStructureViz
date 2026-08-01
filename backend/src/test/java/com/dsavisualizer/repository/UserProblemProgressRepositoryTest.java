package com.dsavisualizer.repository;

import com.dsavisualizer.entity.PracticeProblem;
import com.dsavisualizer.entity.ProblemAttempt;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.entity.UserProblemProgress;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class UserProblemProgressRepositoryTest {
    @Autowired private UserRepository userRepository;
    @Autowired private PracticeProblemRepository problemRepository;
    @Autowired private UserProblemProgressRepository progressRepository;
    @Autowired private ProblemAttemptRepository attemptRepository;

    @Test
    void progressHasOneCurrentRowPerUserAndProblemAndAttemptsRemainAppendOnly() {
        User user = userRepository.save(new User("repo-user", "repo@example.com", "hash", "Repo", "User"));
        PracticeProblem problem = problemRepository.save(
                new PracticeProblem("Two Sum", "Find two values", "easy", "array"));

        UserProblemProgress progress = progressRepository.saveAndFlush(new UserProblemProgress(user, problem));
        ProblemAttempt first = new ProblemAttempt(user, problem, "FAILED", "python");
        ProblemAttempt second = new ProblemAttempt(user, problem, "ACCEPTED", "python");
        attemptRepository.save(first);
        attemptRepository.saveAndFlush(second);

        assertThat(progressRepository.findByUserIdAndProblemId(user.getId(), problem.getId()))
                .containsSame(progress);
        assertThat(attemptRepository.findByUserIdAndProblemIdOrderByCreatedAtDesc(user.getId(), problem.getId()))
                .hasSize(2);
        assertThat(attemptRepository.countByUserIdAndProblemId(user.getId(), problem.getId())).isEqualTo(2);

        assertThatThrownBy(() -> progressRepository.saveAndFlush(new UserProblemProgress(user, problem)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
