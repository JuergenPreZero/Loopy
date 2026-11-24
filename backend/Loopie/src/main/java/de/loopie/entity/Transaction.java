package de.loopie.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.Check;

import java.time.OffsetDateTime;

@Entity
@Table(name = "transactions")
@Check(constraints = "amount IS NOT NULL OR weight IS NOT NULL")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = true)
    private Integer amount;

    @Column(nullable = true)
    private Double weight;

    @Column(name = "transaction_value", nullable = false)
    private int value;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String unitId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @org.hibernate.annotations.CreationTimestamp
    @Column(nullable = false)
    private OffsetDateTime timeStamp;

    public Transaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public OffsetDateTime getTimeStamp() { return timeStamp; }
    public void setTimeStamp(OffsetDateTime timeStamp) { this.timeStamp = timeStamp; }

    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }

    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
}