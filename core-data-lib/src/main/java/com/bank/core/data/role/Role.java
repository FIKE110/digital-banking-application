package com.bank.core.data.role;

import com.bank.core.data.model.AuditModel;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name="roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends AuditModel {
    @Column(unique = true)
    private String roleName;
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Permission> permissions;
}
