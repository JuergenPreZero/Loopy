package de.loopie.dto;

import java.util.UUID;

/**
 * Data Transfer Object for redeeming rewards in exchange for ReCoins.
 */
public class RedeemRequest {
    private UUID userId;
    private String rewardTitle;
    private int cost;

    public RedeemRequest() {}

    public RedeemRequest(UUID userId, String rewardTitle, int cost) {
        this.userId = userId;
        this.rewardTitle = rewardTitle;
        this.cost = cost;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getRewardTitle() { return rewardTitle; }
    public void setRewardTitle(String rewardTitle) { this.rewardTitle = rewardTitle; }

    public int getCost() { return cost; }
    public void setCost(int cost) { this.cost = cost; }
}