package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "virtual_catchment_address_mapping_table")
@BatchSize(size = 100)
public class VirtualCatchment {
    @Id
    @Column
    @NotNull
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "catchment_id")
    private Catchment catchment;

    @ManyToOne(cascade = {CascadeType.ALL})
    @JoinColumn(name = "addresslevel_id")
    private AddressLevel addressLevel;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Catchment getCatchment() {
        return catchment;
    }

    public void setCatchment(Catchment catchment) {
        this.catchment = catchment;
    }

    public AddressLevel getAddressLevel() {
        return addressLevel;
    }

    public void setAddressLevel(AddressLevel addressLevel) {
        this.addressLevel = addressLevel;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VirtualCatchment that = (VirtualCatchment) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(catchment, that.catchment) &&
                Objects.equals(addressLevel, that.addressLevel);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, catchment, addressLevel);
    }
}
