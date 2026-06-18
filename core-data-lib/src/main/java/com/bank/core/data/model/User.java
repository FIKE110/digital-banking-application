package com.bank.core.data.model;

import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table( name = "users")
public class User extends AuditModel{

    @column ( name = "username")
    private String username;
    @column ( name = "email")
    private String email;
    @column ( name = "password")
    private String password;


}
