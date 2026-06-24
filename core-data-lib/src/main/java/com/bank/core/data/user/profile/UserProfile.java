package com.bank.core.data.user.profile;

import com.bank.common.enums.Gender;
import com.bank.core.data.embed.CustomerName;
import com.bank.core.data.embed.Location;
import com.bank.core.data.model.AuditModel;
import jakarta.persistence.*;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "user_profile")
public class UserProfile extends AuditModel {

    @Embedded
    private CustomerName name;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Embedded
    private Location location;

}
