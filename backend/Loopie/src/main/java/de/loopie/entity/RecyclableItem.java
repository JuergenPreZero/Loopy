package de.loopie.entity;

import java.util.Arrays;
import java.util.Optional;

public enum RecyclableItem {
    TENNIS_BALL("Tennis Ball", 20),
    RUNNING_SHOES("Laufschuhe", 50),
    TSHIRT("T-Shirt", 35);

    private final String displayName;
    private final int rewardPoints;

    RecyclableItem(String displayName, int rewardPoints) {
        this.displayName = displayName;
        this.rewardPoints = rewardPoints;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getRewardPoints() {
        return rewardPoints;
    }

    public static Optional<RecyclableItem> fromDisplayName(String name) {
        if (name == null) return Optional.empty();
        return Arrays.stream(values())
                .filter(item -> item.displayName.equalsIgnoreCase(name.trim()))
                .findFirst();
    }
}