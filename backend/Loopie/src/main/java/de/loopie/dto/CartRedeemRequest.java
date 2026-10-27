package de.loopie.dto;

import java.util.List;
import java.util.UUID;

public class CartRedeemRequest {
    private UUID userId;
    private List<CartItemDTO> items;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public List<CartItemDTO> getItems() { return items; }
    public void setItems(List<CartItemDTO> items) { this.items = items; }

    public static class CartItemDTO {
        private UUID rewardId;
        private int quantity;

        public UUID getRewardId() { return rewardId; }
        public void setRewardId(UUID rewardId) { this.rewardId = rewardId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}