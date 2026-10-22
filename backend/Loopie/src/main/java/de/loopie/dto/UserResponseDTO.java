package de.loopie.dto;

import de.loopie.entity.Role;
import de.loopie.entity.User;
import java.util.UUID;

public class UserResponseDTO {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String publicId;
    private int balance;
    private Role role;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.publicId = user.getPublicId();
        this.balance = user.getBalance();
        this.role = user.getRole();
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPublicId() { return publicId; }
    public int getBalance() { return balance; }
    public Role getRole() { return role; }
}