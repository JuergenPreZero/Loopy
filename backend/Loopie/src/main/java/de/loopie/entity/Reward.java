package de.loopie.entity;

import jakarta.persistence.*;
import java.util.UUID;

/**
 * Entity representing a partner reward that users can redeem using ReCoins.
 */
@Entity
@Table(name = "rewards")
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String partnerName;

    @Column(nullable = false)
    private int cost;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    public Reward() {}

    public Reward(String title, String partnerName, int cost, String description, boolean active) {
        this.title = title;
        this.partnerName = partnerName;
        this.cost = cost;
        this.description = description;
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public int getCost() {
        return cost;
    }

    public void setCost(int cost) {
        this.cost = cost;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}