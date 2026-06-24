package com.bank.core.data.user;

import com.bank.core.data.model.AuditModel;
import com.bank.core.data.role.Permission;
import com.bank.core.data.role.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends AuditModel implements UserDetails {

    @Column(name = "username",unique = true)
    private String username;
    @Column(name="uid",unique = true)
    private String uid;
    @Column(name = "email",unique = true)
    private String email;
    @Column(name = "password")
    private String password;
    @Column(name="last_logout_date")
    private LocalDateTime lastLogoutDate;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Permission> permissions;

    private Collection<? extends GrantedAuthority> authorities;

    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> grantedAuthorities = new HashSet<>();
        role.getPermissions().forEach(permission -> {
            grantedAuthorities.add(new SimpleGrantedAuthority(permission.getPermissionName()));
        });

        grantedAuthorities.add(new SimpleGrantedAuthority(role.getRoleName()));
        permissions.forEach(permission -> {
            new SimpleGrantedAuthority(permission.getPermissionName());
        });

        return grantedAuthorities;
    }

}
