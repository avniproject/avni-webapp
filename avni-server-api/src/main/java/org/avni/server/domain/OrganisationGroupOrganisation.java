package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;

@Entity
@Table(name = "organisation_group_organisation")
@BatchSize(size = 100)
public class OrganisationGroupOrganisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organisation_group_id", nullable = false)
    private OrganisationGroup organisationGroup;

    @Column
    private Long organisationId;

    public OrganisationGroup getOrganisationGroup() {
        return organisationGroup;
    }

    public void setOrganisationGroup(OrganisationGroup organisationGroup) {
        this.organisationGroup = organisationGroup;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }
}
