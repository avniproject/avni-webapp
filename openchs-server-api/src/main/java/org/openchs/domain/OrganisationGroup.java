package org.openchs.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "organisation_group")
public class OrganisationGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column
    private String name;

    @Column
    private String dbUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @JsonIgnore
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "organisationGroup")
    private Set<OrganisationGroupOrganisation> organisationGroupOrganisations = new HashSet<>();

    public Set<OrganisationGroupOrganisation> getOrganisationGroupOrganisations() {
        return organisationGroupOrganisations;
    }

    public void setOrganisationGroupOrganisations(Set<OrganisationGroupOrganisation> organisationGroupOrganisations) {
        this.organisationGroupOrganisations.clear();
        if (organisationGroupOrganisations != null) {
            this.organisationGroupOrganisations.addAll(organisationGroupOrganisations);
        }
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

    public String getDbUser() {
        return dbUser;
    }

    public void setDbUser(String dbUser) {
        this.dbUser = dbUser;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

}
