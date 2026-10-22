package de.loopie.controller;

import de.loopie.dto.*;
import de.loopie.entity.Reward;
import de.loopie.entity.Transaction;
import de.loopie.entity.User;
import de.loopie.repository.TransactionRepository;
import de.loopie.service.LoopieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST-Controller for the main functions of the application.
 */
@RestController
@RequestMapping("/api/loopie")
@CrossOrigin(origins = "*")
public class LoopieController {

    private final LoopieService loopieService;
    private final TransactionRepository transactionRepository;

    public LoopieController(LoopieService loopieService, TransactionRepository transactionRepository) {
        this.loopieService = loopieService;
        this.transactionRepository = transactionRepository;
    }
    /**
     * Endpoint for calling USERS current amount of items.
     *
     * @param userId An ID meant to identify USER.
     * @return HTTP 200 OK with the amount.
     */
    @GetMapping("/quantity/{userId}")
    public ResponseEntity<Integer> getQuantity(@PathVariable UUID userId) {
        return ResponseEntity.ok(loopieService.getTotalQuantity(userId));
    }

    /**
     * Retrieves the current ReCoins balance for a specific user.
     *
     * @param userId the unique identifier of the user
     * @return HTTP 200 OK with the user's current balance
     */
    @GetMapping("/balance/{userId}")
    public ResponseEntity<Integer> getBalance(@PathVariable UUID userId) {
        User user = loopieService.getUserById(userId);
        return ResponseEntity.ok(user.getBalance());
    }

    /**
     * Retrieves the user profile details by user ID.
     *
     * @param userId the unique identifier of the user
     * @return HTTP 200 OK with the {@link UserResponseDTO}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable UUID userId) {
        User user = loopieService.getUserById(userId);
        return ResponseEntity.ok(new UserResponseDTO(user));
    }

    /**
     * Deletes a user account by user ID.
     *
     * @param userId the unique identifier of the user to delete
     * @return HTTP 204 No Content upon successful deletion
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<UserResponseDTO> deleteUser(@PathVariable UUID userId) {
        loopieService.deleteUserById(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves the transaction history for a specific user, ordered by timestamp descending.
     *
     * @param userId the unique identifier of the user
     * @return HTTP 200 OK with a list of {@link Transaction} entities
     */
    @GetMapping("/user/{userId}/transactions")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable UUID userId) {
        return ResponseEntity.ok(transactionRepository.findByUser_IdOrderByTimeStampDesc(userId));
    }

    /**
     * Endpoint for registering when a throwIn of any kind has happened.
     *
     * @param request Data object send by iot
     * @return HTTP 200 OK with the saved data {@link Transaction}
     */
    @PostMapping("/throw-in")
    public ResponseEntity<Transaction> registerThrowIn(@RequestBody ThrowInRequest request) {
        Transaction savedTransaction = loopieService.processThrowIn(request);
        return ResponseEntity.ok(savedTransaction);
    }

    /**
     * Endpoint for redeeming rewards using ReCoins.
     *
     * @param request data transfer object containing redemption details
     * @return HTTP 200 OK with {@link Transaction} or HTTP 400 Bad Request on failure
     */
    @PostMapping("/redeem")
    public ResponseEntity<?> redeemReward(@RequestBody RedeemRequest request) {
        try {
            Transaction transaction = loopieService.redeemReward(request);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rewards")
    public ResponseEntity<List<Reward>> getRewards() {
        return ResponseEntity.ok(loopieService.getActiveRewards());
    }

    /**
     * Updates an existing user's profile information.
     *
     * @param userId the unique identifier of the user to update
     * @param request data transfer object containing the updated user fields
     * @return HTTP 200 OK with the updated {@link UserResponseDTO}, or HTTP 400 Bad Request on failure
     */
    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable UUID userId,
            @RequestBody UpdateUserRequest request) {
        try {
            UserResponseDTO updated = loopieService.updateUserProfile(userId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rewards")
    public ResponseEntity<?> createReward(@RequestBody CreateRewardRequest request) {
        try {
            Reward createdReward = loopieService.createReward(request);
            return ResponseEntity.ok(createdReward);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/rewards/{rewardId}")
    public ResponseEntity<?> deleteReward(
            @PathVariable UUID rewardId,
            @RequestParam UUID adminUserId) {
        try {
            loopieService.deleteReward(rewardId, adminUserId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}