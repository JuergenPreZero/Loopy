package de.loopie.entity;

import jakarta.persistence.*;
import  java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Users entity, explains the structure of Users table.
 */
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 8, unique = true)
    private String publicId;

    @Column(nullable = false,length = 50)
    private String firstName;

    @Column(nullable = false,length = 50)
    private String lastName;

    @Column(nullable = false,length = 100,unique = true)
    private String email;

    @Column(nullable = false)
    private int balance;

    @Column(nullable = false,length = 100)
    private String password;

    @Column(length = 10)
    private String oneTimeCode;

    @Column(nullable = false)
    private boolean isVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions;

    public User() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getBalance() {
        return balance;
    }

    public void setBalance(int balance) {
        this.balance = balance;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getOneTimeCode() {
        return oneTimeCode;
    }

    public void setOneTimeCode(String oneTimeCode) {
        this.oneTimeCode = oneTimeCode;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public Role getRole() {return role;}

    public void setRole(Role role) {this.role = role;}
}
