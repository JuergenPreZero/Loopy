package de.loopie.service;

import de.loopie.dto.ThrowInRequest;
import de.loopie.entity.Transaction;
import de.loopie.entity.TransactionType;
import de.loopie.entity.User;
import de.loopie.repository.TransactionRepository;
import de.loopie.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private static final Map<String, Integer> UNIT_PRICES = Map.of(
            "Tennis Ball", 20,
            "Laufschuhe", 50,
            "T-Shirt", 35
    );

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public int getTotalQuantity(UUID userId) {
        return transactionRepository.sumAmountByUserIdAndType(userId, TransactionType.RECYCLING);
    }

    public int getUserBalance(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User " + userId + " not found."));
        return user.getBalance();
    }

    public List<Transaction> getUserTransactions(UUID userId) {
        return transactionRepository.findByUser_IdOrderByTimeStampDesc(userId);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Transaction processThrowIn(ThrowInRequest request) {
        User user = userRepository.findByPublicId(request.getPublicId())
                .orElseThrow(() -> new IllegalArgumentException("Station ID invalid: " + request.getPublicId()));

        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        Integer unitPrice = UNIT_PRICES.get(request.getUnitId());
        if (unitPrice == null) {
            throw new IllegalArgumentException("Unknown recyclable item: " + request.getUnitId());
        }

        int earnedPoints = unitPrice * request.getAmount();

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(request.getAmount());
        tx.setValue(earnedPoints);
        tx.setUnitId(request.getUnitId());
        tx.setType(TransactionType.RECYCLING);
        Transaction saved = transactionRepository.save(tx);

        user.setBalance(user.getBalance() + earnedPoints);
        userRepository.save(user);

        return saved;
    }
}