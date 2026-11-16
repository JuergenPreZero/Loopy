package de.loopie.service;

import de.loopie.common.InsufficientBalanceException;
import de.loopie.common.ResourceNotFoundException;
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

    private static final int MAX_TOTAL_ITEMS = 10;
    private static final int MAX_PER_ITEM = 5;

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
                null,
                true
        );

        return rewardRepository.save(reward);
    }

    @Transactional
    public void deleteReward(UUID rewardId) {
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found: " + rewardId));

        reward.setActive(false);
        rewardRepository.save(reward);
    }

    @Transactional(rollbackFor = Exception.class)
    public Transaction redeemCart(UUID authenticatedUserId, CartRedeemRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Warenkorb darf nicht leer sein.");
        }

        int requestedTotalQuantity = 0;
        for (CartRedeemRequest.CartItemDTO item : request.getItems()) {
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Menge muss größer als 0 sein.");
            }
            if (item.getQuantity() > MAX_PER_ITEM) {
                throw new IllegalArgumentException("Maximal " + MAX_PER_ITEM + " Stück pro Prämie erlaubt.");
            }
            requestedTotalQuantity += item.getQuantity();
        }

        if (requestedTotalQuantity > MAX_TOTAL_ITEMS) {
            throw new IllegalArgumentException("Maximal " + MAX_TOTAL_ITEMS + " Artikel pro Einlösung möglich.");
        }

        User user = userRepository.findByIdForUpdate(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authenticatedUserId));

        int totalCost = 0;
        int totalQuantity = 0;
        List<String> itemSummaries = new ArrayList<>();

        for (CartRedeemRequest.CartItemDTO item : request.getItems()) {
            Reward reward = rewardRepository.findById(item.getRewardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reward not found: " + item.getRewardId()));

            if (!reward.isActive()) {
                throw new IllegalStateException("Prämie '" + reward.getTitle() + "' ist nicht mehr verfügbar.");
            }

            totalCost += (reward.getCost() * item.getQuantity());
            totalQuantity += item.getQuantity();
            itemSummaries.add(item.getQuantity() + "x " + reward.getTitle());
        }

        Long currentBalance = transactionRepository.sumBalanceByUserId(authenticatedUserId);
        long availableBalance = (currentBalance != null) ? currentBalance : 0L;

        if (availableBalance < totalCost) {
            throw new InsufficientBalanceException("Nicht genügend ReCoins vorhanden.");
        }

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(totalQuantity);
        tx.setValue(-totalCost);
        tx.setUnitId(String.join(", ", itemSummaries));
        tx.setType(TransactionType.REDEMPTION);

        return transactionRepository.save(tx);
    }
}