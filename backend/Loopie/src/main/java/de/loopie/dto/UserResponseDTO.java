package de.loopie.dto;

import de.loopie.entity.User;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Data Transfer Object representing user account details exposed to clients.
 */
public class UserResponseDTO {
    private UUID id;
    private String publicId;
    private String firstName;
    private String lastName;
    private String email;
    private int balance;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.balance = user.getBalance();
        this.publicId = user.getPublicId();
    }

    public UUID getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public int getBalance() { return balance; }
    public String getPublicId() { return publicId; }

}