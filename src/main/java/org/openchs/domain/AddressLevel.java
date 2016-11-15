package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "address_level")
public class AddressLevel extends CHSEntity {
    @Column
    @NotNull
    private String title;

    @Column
    @NotNull
    private int level;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private AddressLevel parentAddressLevel;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public AddressLevel getParentAddressLevel() {
        return parentAddressLevel;
    }

    public void setParentAddressLevel(AddressLevel parentAddressLevel) {
        this.parentAddressLevel = parentAddressLevel;
    }
}