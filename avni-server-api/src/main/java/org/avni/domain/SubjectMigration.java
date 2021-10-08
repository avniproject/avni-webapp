package org.avni.domain;

import org.hibernate.annotations.DynamicInsert;

import javax.persistence.*;

@Entity
@Table(name = "subject_migration")
@DynamicInsert
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
}
