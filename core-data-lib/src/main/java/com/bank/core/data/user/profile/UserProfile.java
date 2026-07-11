package com.bank.core.data.user.profile;

import com.bank.common.enums.Gender;
import com.bank.core.data.embed.CustomerName;
import com.bank.core.data.embed.Location;
import com.bank.core.data.model.AuditModel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile extends AuditModel {

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Embedded
    private CustomerName name;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 20)
    private String phoneNumber;

    @Embedded
    private Location location;
}