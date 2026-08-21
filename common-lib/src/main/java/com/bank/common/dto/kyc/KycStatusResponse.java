package com.bank.common.dto.kyc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycStatusResponse {

    private Long id;
    private String status;
    private String bvnVerificationStatus;
    private String ninVerificationStatus;
    private String tier;
    private boolean verified;
    private String bvn;
    private String nin;
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String country;
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
}