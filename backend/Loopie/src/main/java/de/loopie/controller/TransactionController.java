package de.loopie.controller;

import de.loopie.config.jwt.UserPrincipal;
import de.loopie.dto.ThrowInRequest;
import de.loopie.entity.Transaction;
import de.loopie.repository.UserRepository;
import de.loopie.service.TransactionService;
import de.loopie.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    @Value("${loopie.machine.secret}")
    private String configuredMachineSecret;

    public TransactionController(TransactionService transactionService, UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me/quantity")
    public ResponseEntity<Integer> getMyQuantity(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transactionService.getTotalQuantity(principal.getId()));
    }

    @GetMapping("/me/balance")
    public ResponseEntity<Integer> getMyBalance(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transactionService.getUserBalance(principal.getId()));
    }

    @GetMapping("/me/earned-coins")
    public ResponseEntity<Integer> getMyEarnedCoins(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transactionService.getTotalEarnedCoins(principal.getId()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Transaction>> getMyTransactions(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transactionService.getUserTransactions(principal.getId()));
    }

    @PostMapping("/throw-in")
    public ResponseEntity<Transaction> registerThrowIn(
            @RequestHeader(value = "X-Machine-Secret", required = false) String machineSecret,
            @RequestBody ThrowInRequest request) {

        if (machineSecret == null || !machineSecret.equals(configuredMachineSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(transactionService.processThrowIn(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyPublicId(
            @RequestHeader(value = "X-Machine-Secret", required = false) String machineSecret,
            @RequestBody(required = false) Map<String, String> payload) {

        if (machineSecret == null || !machineSecret.equals(configuredMachineSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (payload == null || payload.get("publicId") == null || payload.get("publicId").isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String publicId = payload.get("publicId").trim();

        return userRepository.findByPublicId(publicId).isPresent()
                ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}