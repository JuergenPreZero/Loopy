package de.loopie.controller;

import de.loopie.config.jwt.UserPrincipal;
import de.loopie.dto.ThrowInRequest;
import de.loopie.entity.Transaction;
import de.loopie.service.TransactionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @Value("${loopie.machine.secret}")
    private String configuredMachineSecret;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/me/quantity")
    public ResponseEntity<Integer> getMyQuantity(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transactionService.getTotalQuantity(principal.getId()));
    }

    @GetMapping("/me/balance")
    public ResponseEntity<Integer> getMyBalance(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transactionService.getUserBalance(principal.getId()));
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
}