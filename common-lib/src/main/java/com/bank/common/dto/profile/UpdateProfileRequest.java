package com.bank.common.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

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
}