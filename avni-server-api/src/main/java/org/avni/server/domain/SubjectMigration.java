package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.DynamicInsert;

import javax.persistence.*;

@Entity
@Table(name = "subject_migration")
@JsonIgnoreProperties({"individual", "oldAddressLevel", "newAddressLevel", "subjectType"})
@DynamicInsert
@BatchSize(size = 100)
public class SubjectMigration extends OrganisationAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_id")
    private Individual individual;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_address_level_id")
    private AddressLevel oldAddressLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_address_level_id")
    private AddressLevel newAddressLevel;

    @Column(name = "old_sync_concept_1_value")
    private String oldSyncConcept1Value;

    @Column(name = "new_sync_concept_1_value")
    private String newSyncConcept1Value;

    @Column(name = "old_sync_concept_2_value")
    private String oldSyncConcept2Value;

    @Column(name = "new_sync_concept_2_value")
    private String newSyncConcept2Value;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_type_id")
    private SubjectType subjectType;

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public AddressLevel getOldAddressLevel() {
        return oldAddressLevel;
    }

    public void setOldAddressLevel(AddressLevel oldAddressLevel) {
        this.oldAddressLevel = oldAddressLevel;
    }

    public AddressLevel getNewAddressLevel() {
        return newAddressLevel;
    }

    public void setNewAddressLevel(AddressLevel newAddressLevel) {
        this.newAddressLevel = newAddressLevel;
    }

    public String getOldSyncConcept1Value() {
        return oldSyncConcept1Value;
    }

    public void setOldSyncConcept1Value(String oldSyncConcept1Value) {
        this.oldSyncConcept1Value = oldSyncConcept1Value;
    }

    public String getNewSyncConcept1Value() {
        return newSyncConcept1Value;
    }

    public void setNewSyncConcept1Value(String newSyncConcept1Value) {
        this.newSyncConcept1Value = newSyncConcept1Value;
    }

    public String getOldSyncConcept2Value() {
        return oldSyncConcept2Value;
    }

    public void setOldSyncConcept2Value(String oldSyncConcept2Value) {
        this.oldSyncConcept2Value = oldSyncConcept2Value;
    }

    public String getNewSyncConcept2Value() {
        return newSyncConcept2Value;
    }

    public void setNewSyncConcept2Value(String newSyncConcept2Value) {
        this.newSyncConcept2Value = newSyncConcept2Value;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }
}
