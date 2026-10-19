package de.loopie.service;

import de.loopie.dto.ThrowInRequest;
import de.loopie.entity.Transaction;
import de.loopie.entity.User;
import de.loopie.repository.TransactionRepository;
import de.loopie.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import de.loopie.dto.UpdateUserRequest;
import de.loopie.dto.UserResponseDTO;
import java.util.Locale;
import java.util.Optional;

/**
 * Main Service for Loopie, handles transactional logic.
 */
@Service
public class LoopieService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    /**
     * Valuation mapping defining ReCoin rewards for each supported item type.
     */
    private static final Map<String, Integer> unitPrices = Map.of(
            "Tennis Ball",20,
            "Laufschuhe",50,
            "T-Shirt",35
    );

    public LoopieService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Gets the total amount of all the units summed by userid.
     * @param userId An ID meant to identify USER.
     * @param userId An ID meant to identify USER.
     * @return returns USER total amount of items.
     */
    public int getTotalQuantity(UUID userId) {
        Integer total = transactionRepository.sumAmountByUserId(userId);
        return total != null ? total : 0;
    }

    /**
     * Retrieves a user entity by internal user ID.
     *
     * @param userId the unique identifier of the user
     * @return the {@link User} entity
     */
    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User "+ userId + " not found"));
    }

    /**
     * Deletes a user account and associated record by user ID.
     *
     * @param userId the unique identifier of the user to delete
     */
    public void deleteUserById(UUID userId) {
        userRepository.deleteById(userId);
    }

    /**
     * Checks for existing User and valid UnitID. Calculates the total value.
     * saves values persistently.
     * @param request Data object send by iot
     * @return the transactional entity {@link Transaction}.
     */
    @Transactional
    public Transaction processThrowIn(ThrowInRequest request) {
        User user = userRepository.findByPublicId(request.getPublicId())
                .orElseThrow(() -> new IllegalArgumentException("User with Public ID " + request.getPublicId() + " not found"));

        if (request.getUnitId() == null || !unitPrices.containsKey(request.getUnitId())) {
            throw new IllegalArgumentException("Unit ID " + request.getUnitId() + " does not exist");
        }

        int unitPrice = unitPrices.getOrDefault(request.getUnitId(), 0);
        int totalValue = unitPrice * request.getAmount();

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(request.getAmount());
        transaction.setValue(totalValue);
        transaction.setUnitId(request.getUnitId());
        Transaction savedTransaction = transactionRepository.save(transaction);

        Long totalBalance = transactionRepository.sumBalanceByUserId(user.getId());

        user.setBalance(totalBalance != null ? totalBalance.intValue() : 0);
        userRepository.save(user);

        return savedTransaction;
    }

    /**
     * Processes an incoming recycling throw-in event triggered by an IoT station.
     * Validates user identity and item type, computes total ReCoins earned, records
     * the transaction, and recalculates the user's materialized balance on write.
     *
     * @param request data transfer object containing the IoT throw-in event details
     * @return the persisted {@link Transaction} entity
     */
    @Transactional
    public UserResponseDTO updateUserProfile(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User " + userId + " nicht gefunden"));

        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("Vorname darf nicht leer sein.");
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nachname darf nicht leer sein.");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("E-Mail darf nicht leer sein.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
            throw new IllegalArgumentException("Diese E-Mail-Adresse wird bereits verwendet.");
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(normalizedEmail);

        User savedUser = userRepository.save(user);
        return new UserResponseDTO(savedUser);
    }
}