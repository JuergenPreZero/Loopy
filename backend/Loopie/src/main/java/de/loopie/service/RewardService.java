package de.loopie.service;

import de.loopie.common.InsufficientBalanceException;
import de.loopie.dto.BatchRedeemRequest;
import de.loopie.dto.CreateRewardRequest;
import de.loopie.dto.RedeemRequest;
import de.loopie.entity.*;
import de.loopie.repository.RewardRepository;
import de.loopie.repository.TransactionRepository;
import de.loopie.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public RewardService(RewardRepository rewardRepository,
                         UserRepository userRepository,
                         TransactionRepository transactionRepository) {
        this.rewardRepository = rewardRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Reward> getActiveRewards() {
        return rewardRepository.findByActiveTrue();
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Transaction redeemReward(RedeemRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));

        if (request.getCost() <= 0) {
            throw new IllegalArgumentException("Cost must be greater than zero.");
        }

        if (user.getBalance() < request.getCost()) {
            throw new InsufficientBalanceException("Insufficient ReCoins balance.");
        }

        user.setBalance(user.getBalance() - request.getCost());
        userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setUnitId(request.getRewardTitle());
        tx.setAmount(1);
        tx.setValue(-request.getCost());
        tx.setType(TransactionType.REDEMPTION);

        return transactionRepository.save(tx);
    }

    @Transactional
    public Reward createReward(CreateRewardRequest request) {
        User user = userRepository.findById(request.getAdminUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: Only administrators can create rewards.");
        }

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title must not be empty.");
        }
        if (request.getPartnerName() == null || request.getPartnerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Partner name must not be empty.");
        }
        if (request.getCost() <= 0) {
            throw new IllegalArgumentException("Cost must be greater than zero.");
        }

        Reward reward = new Reward(
                request.getTitle().trim(),
                request.getPartnerName().trim(),
                request.getCost(),
                request.getDescription(),
                true
        );

        return rewardRepository.save(reward);
    }

    @Transactional
    public void deleteReward(UUID rewardId, UUID adminUserId) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: Only administrators can delete rewards.");
        }

        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new IllegalArgumentException("Reward does not exist."));

        reward.setActive(false);
        rewardRepository.save(reward);
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public List<Transaction> redeemBatch(BatchRedeemRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));

        int totalCost = 0;
        for (BatchRedeemRequest.RedeemItemDTO item : request.getItems()) {
            if (item.getCost() <= 0 || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Ungültige Kosten oder Menge.");
            }
            totalCost += (item.getCost() * item.getQuantity());
        }

        if (user.getBalance() < totalCost) {
            throw new InsufficientBalanceException("Insufficient ReCoins balance for order.");
        }

        user.setBalance(user.getBalance() - totalCost);
        userRepository.save(user);

        List<Transaction> savedTransactions = new ArrayList<>();
        for (BatchRedeemRequest.RedeemItemDTO item : request.getItems()) {
            for (int i = 0; i < item.getQuantity(); i++) {
                Transaction tx = new Transaction();
                tx.setUser(user);
                tx.setUnitId(item.getRewardTitle());
                tx.setAmount(1);
                tx.setValue(-item.getCost());
                tx.setType(TransactionType.REDEMPTION);
                savedTransactions.add(transactionRepository.save(tx));
            }
        }

        return savedTransactions;
    }
}