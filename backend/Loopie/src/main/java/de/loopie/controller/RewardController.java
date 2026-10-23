package de.loopie.controller;

import de.loopie.dto.BatchRedeemRequest;
import de.loopie.dto.CreateRewardRequest;
import de.loopie.dto.RedeemRequest;
import de.loopie.entity.Reward;
import de.loopie.entity.Transaction;
import de.loopie.service.RewardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin(origins = "*")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping
    public ResponseEntity<List<Reward>> getRewards() {
        return ResponseEntity.ok(rewardService.getActiveRewards());
    }

    @PostMapping("/redeem")
    public ResponseEntity<Transaction> redeemReward(@RequestBody RedeemRequest request) {
        return ResponseEntity.ok(rewardService.redeemReward(request));
    }

    @PostMapping("/redeem-batch")
    public ResponseEntity<List<Transaction>> redeemBatch(@RequestBody BatchRedeemRequest request) {
        return ResponseEntity.ok(rewardService.redeemBatch(request));
    }

    @PostMapping
    public ResponseEntity<Reward> createReward(@RequestBody CreateRewardRequest request) {
        return ResponseEntity.ok(rewardService.createReward(request));
    }

    @DeleteMapping("/{rewardId}")
    public ResponseEntity<Void> deleteReward(
            @PathVariable UUID rewardId,
            @RequestParam UUID adminUserId) {
        rewardService.deleteReward(rewardId, adminUserId);
        return ResponseEntity.noContent().build();
    }
}