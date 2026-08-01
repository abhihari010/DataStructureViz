package com.dsavisualizer.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ForgotPassword {

    public static final String RESET_PASSWORD_PURPOSE = "PASSWORD_RESET";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer fpid;

    @Column(nullable = false)
    private Integer otp;

    @Column(nullable = false)
    private Date expirationTime;

    @Column
    private Boolean otpConsumed;

    @Column
    private Date otpVerifiedAt;

    @Column(length = 128)
    private String resetProofHash;

    @Column(length = 64)
    private String resetProofPurpose;

    @Column
    private Date resetProofExpirationTime;

    @Column
    private Boolean resetProofConsumed;

    @Column
    private Integer requestCount;

    @Column
    private Date requestWindowStartedAt;

    @OneToOne
    private User user;
}
