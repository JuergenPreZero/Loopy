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
        Integer quantity = transactionRepository.sumAmountByUserIdAndType(userId, TransactionType.RECYCLING);
        return quantity != null ? quantity : 0;
    }

    public int getUserBalance(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User " + userId + " not found.");
        }
        Long balance = transactionRepository.sumBalanceByUserId(userId);
        return balance != null ? balance.intValue() : 0;
    }

    public int getTotalEarnedCoins(UUID userId) {
        Integer earned = transactionRepository.sumValueByUserIdAndType(userId, TransactionType.RECYCLING);
        return earned != null ? earned : 0;
    }

    public List<Transaction> getUserTransactions(UUID userId) {
        return transactionRepository.findByUser_IdOrderByTimeStampDesc(userId);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Transaction processThrowIn(ThrowInRequest request) {
        User user = userRepository.findByPublicIdForUpdate(request.getPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Station ID invalid: " + request.getPublicId()));

        boolean hasAmount = request.getAmount() != null;
        boolean hasWeight = request.getWeight() != null;

        if (!hasAmount && !hasWeight) {
            throw new IllegalArgumentException("At least one dimension (amount or weight) must be provided.");
        }

        RecyclableItem item = RecyclableItem.fromDisplayName(request.getUnitId())
                .orElseThrow(() -> new IllegalArgumentException("Unknown recyclable item: " + request.getUnitId()));

        int earnedPoints = 0;

        if (hasAmount) {
            if (request.getAmount() <= 0) {
                throw new IllegalArgumentException("Amount must be greater than zero.");
            }
            earnedPoints += item.getRewardPoints() * request.getAmount();
        }

        if (hasWeight) {
            if (request.getWeight() <= 0) {
                throw new IllegalArgumentException("Weight must be greater than zero.");
            }
            earnedPoints += (int) Math.round(item.getRewardPoints() * request.getWeight());
        }

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(request.getAmount());
        tx.setWeight(request.getWeight());
        tx.setValue(earnedPoints);
        tx.setUnitId(item.getDisplayName());
        tx.setType(TransactionType.RECYCLING);

        return transactionRepository.save(tx);
    }
}