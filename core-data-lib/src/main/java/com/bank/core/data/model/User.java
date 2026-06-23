package com.bank.core.data.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
public class User extends AuditModel {

    @Column(name = "username")
    private String username;
    @Column(name = "email")
    private String email;
    @Column(name = "password")
    private String password;

}
