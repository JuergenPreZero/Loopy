package de.loopie.dto;

/**
 * Data transfer object for the incoming throw in requests of the IoT.
 */
public class ThrowInRequest {
    private String publicId;
    private Integer amount;
    private Double weight;
    private String unitId;

    public ThrowInRequest() {}

    public void validate() {
        if (publicId == null || publicId.isBlank()) {
            throw new IllegalArgumentException("publicId darf nicht leer sein.");
        }
        if (unitId == null || unitId.isBlank()) {
            throw new IllegalArgumentException("unitId darf nicht leer sein.");
        }

        boolean hasAmount = amount != null;
        boolean hasWeight = weight != null;

        if (!hasAmount && !hasWeight) {
            throw new IllegalArgumentException("Es muss mindestens 'amount' oder 'weight' angegeben werden.");
        }
        if (hasAmount && amount <= 0) {
            throw new IllegalArgumentException("'amount' muss größer als 0 sein.");
        }
        if (hasWeight && weight <= 0) {
            throw new IllegalArgumentException("'weight' muss größer als 0 sein.");
        }
    }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }
}