package com.bank.core.data.role;

import com.bank.core.data.model.AuditModel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="permissions")
@Getter
@Setter
@NoArgsConstructor
public class Permission extends AuditModel {
    @Column(unique = true)
    private String permissionName;
    private String description;
}
