package de.loopie.controller;

import de.loopie.dto.ThrowInRequest;
import de.loopie.entity.Transaction;
import de.loopie.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/user/{userId}/quantity")
    public ResponseEntity<Integer> getQuantity(@PathVariable UUID userId) {
        return ResponseEntity.ok(transactionService.getTotalQuantity(userId));
    }

    @GetMapping("/user/{userId}/balance")
    public ResponseEntity<Integer> getBalance(@PathVariable UUID userId) {
        return ResponseEntity.ok(transactionService.getUserBalance(userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable UUID userId) {
        return ResponseEntity.ok(transactionService.getUserTransactions(userId));
    }

    @PostMapping("/throw-in")
    public ResponseEntity<Transaction> registerThrowIn(@RequestBody ThrowInRequest request) {
        return ResponseEntity.ok(transactionService.processThrowIn(request));
    }
}