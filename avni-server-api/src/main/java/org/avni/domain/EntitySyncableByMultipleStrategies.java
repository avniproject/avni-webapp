package org.avni.domain;

public interface EntitySyncableByMultipleStrategies {

    String getSyncConcept1Value();

    void setSyncConcept1Value(String syncConcept1Value);

    String getSyncConcept2Value();

    void setSyncConcept2Value(String syncConcept2Value);

    Long getAddressId();

    void setAddressId(Long addressId);

    default void copyAttributesFromEntity(EntitySyncableByMultipleStrategies entity) {
        this.setAddressId(entity.getAddressId());
        this.setSyncConcept1Value(entity.getSyncConcept1Value());
        this.setSyncConcept2Value(entity.getSyncConcept2Value());
    }
}
