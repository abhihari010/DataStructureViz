package com.dsavisualizer.controller;


import com.dsavisualizer.dto.ChangePassword;
import com.dsavisualizer.dto.MailBody;
import com.dsavisualizer.entity.ForgotPassword;
import com.dsavisualizer.entity.User;
import com.dsavisualizer.repository.ForgotPasswordRepository;
import com.dsavisualizer.repository.UserRepository;
import com.dsavisualizer.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/forgot-password")
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ForgotPasswordRepository forgotPasswordRepository;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordController(UserRepository userRepository,
                                    EmailService emailService,
                                    ForgotPasswordRepository forgotPasswordRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.forgotPasswordRepository = forgotPasswordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/sendMail/{email}")
    public ResponseEntity<String> sendMail(@PathVariable String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            // Check if there's an existing entry for this user
            Optional<ForgotPassword> existingFp = forgotPasswordRepository.findByUser(user);
            if (existingFp.isPresent()) {
                // Delete the old OTP
                forgotPasswordRepository.delete(existingFp.get());
            }


            int otp = otpGenerator();

            MailBody mailBody = MailBody.builder()
                    .to(email)
                    .text("This is the OTP for your Forgot Password request: " + otp)
                    .subject("OTP for Forgot Password request")
                    .build();

            ForgotPassword fp = ForgotPassword.builder()
                    .otp(otp)
                    .expirationTime(new Date(System.currentTimeMillis() + 10 * 60 * 1000))
                    .user(user)
                    .build();

            emailService.sendSimpleMessage(mailBody);
            forgotPasswordRepository.save(fp);
            return ResponseEntity.ok("Email sent for verification.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process forgot password request. " + e.getMessage());
        }
    }

    @PostMapping("/verifyOtp/{otp}/{email}")
    public ResponseEntity<String> verifyOtp(@PathVariable String email, @PathVariable Integer otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        ForgotPassword fp = forgotPasswordRepository.findByOtpAndUser(otp, user)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (fp.getExpirationTime().before(new Date())) {
            forgotPasswordRepository.deleteById(fp.getFpid());
            throw new RuntimeException("OTP has expired");
        }

        return ResponseEntity.ok("OTP verified successfully.");

    }

    @PostMapping("/changePassword/{email}")
    public ResponseEntity<String> changePasswordHandler(@RequestBody ChangePassword changePassword,
                                                        @PathVariable String email) {
        
        if (changePassword.password() == null || changePassword.password().trim().isEmpty()) {
            return new ResponseEntity<>("Password cannot be empty", HttpStatus.BAD_REQUEST);
        }
        
        boolean passwordsMatch = Objects.equals(changePassword.password(), changePassword.repeatPassword());
        
        if (!passwordsMatch) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords do not match");
        }
        
        String encodedPassword = passwordEncoder.encode(changePassword.password());
        userRepository.updatePassword(email, encodedPassword);
        return ResponseEntity.ok("Password changed successfully.");

    }

    private Integer otpGenerator() {
        Random random = new Random();
        return random.nextInt(100_000, 999_999);
    }



}
