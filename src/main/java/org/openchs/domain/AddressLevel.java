package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "address_level")
public class AddressLevel extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column
    @NotNull
    private int title;

    @Column
    @NotNull
    private int level;

    @ManyToOne(fetch = FetchType.LAZY)
    private AddressLevel parentAddressLevel;
}