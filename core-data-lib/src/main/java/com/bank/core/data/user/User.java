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

    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Role> roles;
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Permission> permissions;

    @Transient
    private Collection<? extends GrantedAuthority> authorities;

    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> grantedAuthorities = new HashSet<>();
        if (roles != null) {
            roles.forEach(role -> {
                if (role.getPermissions() != null) {
                    role.getPermissions().forEach(permission ->
                            grantedAuthorities.add(new SimpleGrantedAuthority(permission.getPermissionName())));
                }
                grantedAuthorities.add(new SimpleGrantedAuthority(role.getRoleName()));
            });
        }
        if (permissions != null) {
            permissions.forEach(permission ->
                    grantedAuthorities.add(new SimpleGrantedAuthority(permission.getPermissionName())));
        }

        return grantedAuthorities;
    }

}
