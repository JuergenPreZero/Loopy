package de.loopie.controller;

import de.loopie.config.jwt.UserPrincipal;
import de.loopie.dto.CartRedeemRequest;
import de.loopie.dto.CreateRewardRequest;
import de.loopie.entity.Reward;
import de.loopie.entity.Transaction;
import de.loopie.service.RewardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping
    public ResponseEntity<List<Reward>> getRewards() {
        return ResponseEntity.ok(rewardService.getActiveRewards());
    }

    @PostMapping("/redeem-cart")
    public ResponseEntity<Transaction> redeemCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CartRedeemRequest request) {
        return ResponseEntity.ok(rewardService.redeemCart(principal.getId(), request));
    }

    @PostMapping
    public ResponseEntity<Reward> createReward(@RequestBody CreateRewardRequest request) {
        return ResponseEntity.ok(rewardService.createReward(request));
    }

    @DeleteMapping("/{rewardId}")
    public ResponseEntity<Void> deleteReward(@PathVariable UUID rewardId) {
        rewardService.deleteReward(rewardId);
        return ResponseEntity.noContent().build();
    }
}