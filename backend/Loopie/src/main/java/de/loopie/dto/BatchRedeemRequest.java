package de.loopie.dto;

import java.util.List;
import java.util.UUID;

public class BatchRedeemRequest {
    private UUID userId;
    private List<RedeemItemDTO> items;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public List<RedeemItemDTO> getItems() { return items; }
    public void setItems(List<RedeemItemDTO> items) { this.items = items; }

    public static class RedeemItemDTO {
        private String rewardTitle;
        private int cost;
        private int quantity;

        public String getRewardTitle() { return rewardTitle; }
        public void setRewardTitle(String rewardTitle) { this.rewardTitle = rewardTitle; }

        public int getCost() { return cost; }
        public void setCost(int cost) { this.cost = cost; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}