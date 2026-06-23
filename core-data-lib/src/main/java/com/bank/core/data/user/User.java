package com.bank.core.data.user;

import com.bank.core.data.model.AuditModel;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

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
    private Collection<? extends GrantedAuthority> authorities;

}
