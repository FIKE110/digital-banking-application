package com.bank.core.data.embed;

import com.bank.common.enums.LocationType;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class Location {
    private String Address;
    private String city;
    private String country;
    private String state;
    private String zip;
    private String longitude;
    private String latitude;
    @Enumerated(EnumType.STRING)
    private LocationType locationType;
}
