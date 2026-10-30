package de.loopie.dto;

public class CreateRewardRequest {
    private String title;
    private String partnerName;
    private int cost;
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public int getCost() { return cost; }
    public void setCost(int cost) { this.cost = cost; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}