package com.dsavisualizer.config;

import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean seedDevUser;
    private final String seedEmail;
    private final String seedPassword;
    private final String seedFirstName;
    private final String seedLastName;

    public UserDataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.dev-user:false}") boolean seedDevUser,
            @Value("${app.seed.email:dev@example.com}") String seedEmail,
            @Value("${app.seed.password:password}") String seedPassword,
            @Value("${app.seed.first-name:Dev}") String seedFirstName,
            @Value("${app.seed.last-name:User}") String seedLastName) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedDevUser = seedDevUser;
        this.seedEmail = seedEmail;
        this.seedPassword = seedPassword;
        this.seedFirstName = seedFirstName;
        this.seedLastName = seedLastName;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeDevUser() {
        if (!seedDevUser) {
            return;
        }

        userRepository.findByEmail(seedEmail).ifPresentOrElse(user -> {
            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                userRepository.save(user);
            }
        }, () -> {
            User user = new User();
            user.setId("local-dev-user");
            user.setEmail(seedEmail);
            user.setPassword(passwordEncoder.encode(seedPassword));
            user.setFirstName(seedFirstName);
            user.setLastName(seedLastName);
            user.setEmailVerified(true);
            userRepository.save(user);
        });
    }
}
