package com.bank.core.data.embed;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class CustomerName {
    private String firstName;
    private String lastName;
    private String otherNames;
    private String middleName;
}
