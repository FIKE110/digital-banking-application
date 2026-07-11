package com.bank.common.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {

    private String username;
    private String email;
    private String uid;

    private String firstName;
    private String lastName;
    private String otherNames;
    private String middleName;

    private LocalDate dateOfBirth;
    private String gender;
    private String phoneNumber;

    private String address;
    private String city;
    private String country;
    private String state;
    private String zip;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}