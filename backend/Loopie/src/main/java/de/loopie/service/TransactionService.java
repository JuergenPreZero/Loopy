package de.loopie.service;

import de.loopie.common.ResourceNotFoundException;
import de.loopie.dto.ThrowInRequest;
import de.loopie.entity.RecyclableItem;
import de.loopie.entity.Transaction;
import de.loopie.entity.TransactionType;
import de.loopie.entity.User;
import de.loopie.repository.TransactionRepository;
import de.loopie.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public int getTotalQuantity(UUID userId) {
        return transactionRepository.sumAmountByUserIdAndType(userId, TransactionType.RECYCLING);
    }

    public int getUserBalance(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getBalance)
                .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " not found."));
    }

    public List<Transaction> getUserTransactions(UUID userId) {
        return transactionRepository.findByUser_IdOrderByTimeStampDesc(userId);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Transaction processThrowIn(ThrowInRequest request) {
        User user = userRepository.findByPublicId(request.getPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Station ID invalid: " + request.getPublicId()));

        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        RecyclableItem item = RecyclableItem.fromDisplayName(request.getUnitId())
                .orElseThrow(() -> new IllegalArgumentException("Unknown recyclable item: " + request.getUnitId()));

        int earnedPoints = item.getRewardPoints() * request.getAmount();

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(request.getAmount());
        tx.setValue(earnedPoints);
        tx.setUnitId(item.getDisplayName());
        tx.setType(TransactionType.RECYCLING);
        Transaction saved = transactionRepository.save(tx);

        user.setBalance(user.getBalance() + earnedPoints);
        userRepository.save(user);

        return saved;
    }
}