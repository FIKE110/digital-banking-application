package com.bank.core.data.user.kyc;

import com.bank.common.enums.KycTier;
import com.bank.common.enums.VerificationStatus;
import com.bank.core.data.model.AuditModel;
import com.bank.core.data.user.profile.UserProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_kyc")
@Getter
@Setter
public class UserKyc extends AuditModel {
    @OneToOne
    @JoinColumn(name = "user_profile_id")
    private UserProfile user;
    @Column(name = "bvn_no")
    private String bvn;
    @Enumerated(EnumType.STRING)
    private VerificationStatus bvnVerificationStatus;
    @Column(name = "nin_no")
    private String nin;
    @Enumerated(EnumType.STRING)
    private VerificationStatus ninVerificationStatus;
    @Enumerated(EnumType.STRING)
    @Column(name = "tier")
    private KycTier tier = KycTier.TIER_1;
}
