package de.loopie.service;

import de.loopie.common.InsufficientBalanceException;
import de.loopie.dto.CartRedeemRequest;
import de.loopie.dto.CreateRewardRequest;
import de.loopie.entity.*;
import de.loopie.repository.RewardRepository;
import de.loopie.repository.TransactionRepository;
import de.loopie.repository.UserRepository;
import org.springframework.stereotype.Service;
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

    @Transactional
    public Reward createReward(CreateRewardRequest request) {
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
    public void deleteReward(UUID rewardId) {
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new IllegalArgumentException("Reward does not exist."));

        reward.setActive(false);
        rewardRepository.save(reward);
    }

    @Transactional(rollbackFor = Exception.class)
    public Transaction redeemCart(UUID authenticatedUserId, CartRedeemRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty.");
        }

        User user = userRepository.findByIdForUpdate(authenticatedUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authenticatedUserId));

        int totalCost = 0;
        int totalQuantity = 0;
        List<String> itemSummaries = new ArrayList<>();

        for (CartRedeemRequest.CartItemDTO item : request.getItems()) {
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero.");
            }

            Reward reward = rewardRepository.findById(item.getRewardId())
                    .orElseThrow(() -> new IllegalArgumentException("Reward not found: " + item.getRewardId()));

            if (!reward.isActive()) {
                throw new IllegalStateException("Reward '" + reward.getTitle() + "' is no longer active.");
            }

            totalCost += (reward.getCost() * item.getQuantity());
            totalQuantity += item.getQuantity();
            itemSummaries.add(item.getQuantity() + "x " + reward.getTitle());
        }

        if (user.getBalance() < totalCost) {
            throw new InsufficientBalanceException("Insufficient ReCoins balance.");
        }

        user.setBalance(user.getBalance() - totalCost);
        userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(totalQuantity);
        tx.setValue(-totalCost);
        tx.setUnitId(String.join(", ", itemSummaries));
        tx.setType(TransactionType.REDEMPTION);

        return transactionRepository.save(tx);
    }

    @Transactional(rollbackFor = Exception.class)
    public Transaction redeemCart(CartRedeemRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty.");
        }

        User user = userRepository.findByIdForUpdate(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));

        int totalCost = 0;
        int totalQuantity = 0;
        List<String> itemSummaries = new ArrayList<>();

        for (CartRedeemRequest.CartItemDTO item : request.getItems()) {
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero.");
            }

            Reward reward = rewardRepository.findById(item.getRewardId())
                    .orElseThrow(() -> new IllegalArgumentException("Reward not found: " + item.getRewardId()));

            if (!reward.isActive()) {
                throw new IllegalStateException("Reward '" + reward.getTitle() + "' is no longer active.");
            }

            totalCost += (reward.getCost() * item.getQuantity());
            totalQuantity += item.getQuantity();
            itemSummaries.add(item.getQuantity() + "x " + reward.getTitle());
        }

        if (user.getBalance() < totalCost) {
            throw new InsufficientBalanceException("Insufficient ReCoins balance.");
        }

        user.setBalance(user.getBalance() - totalCost);
        userRepository.save(user);

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(totalQuantity);
        tx.setValue(-totalCost);
        tx.setUnitId(String.join(", ", itemSummaries));
        tx.setType(TransactionType.REDEMPTION);

        return transactionRepository.save(tx);
    }
}