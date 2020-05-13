package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.openchs.application.projections.BaseProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Entity
@Table(name = "encounter_type")
@JsonIgnoreProperties({"operationalEncounterTypes"})
@DynamicInsert
public class EncounterType extends OrganisationAwareEntity {
    @NotNull
    @Column
    private String name;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="concept_id")
    private Concept concept;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "encounterType")
    private Set<OperationalEncounterType> operationalEncounterTypes = new HashSet<>();

    @Column(name = "encounter_eligibility_check_rule")
    private String encounterEligibilityCheckRule;

    private Boolean active;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Concept getConcept() {
        return concept;
    }

    public void setConcept(Concept concept) {
        this.concept = concept;
    }

    public static EncounterType create(String name) {
        EncounterType encounterType = new EncounterType();
        encounterType.setName(name);
        return encounterType;
    }

    public Set<OperationalEncounterType> getOperationalEncounterTypes() {
        return operationalEncounterTypes;
    }

    public void setOperationalEncounterTypes(Set<OperationalEncounterType> operationalEncounterTypes) {
        this.operationalEncounterTypes = operationalEncounterTypes;
    }

    @JsonIgnore
    public String getOperationalEncounterTypeName() {
        return operationalEncounterTypes.stream()
                .map(OperationalEncounterType::getName)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    public String getEncounterEligibilityCheckRule() {
        return encounterEligibilityCheckRule;
    }

    public void setEncounterEligibilityCheckRule(String encounterEligibilityCheckRule) {
        this.encounterEligibilityCheckRule = encounterEligibilityCheckRule;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = Optional.ofNullable(active).orElse(true);
    }

    @Projection(name = "EncounterTypeProjection", types = {EncounterType.class})
    public interface EncounterTypeProjection extends BaseProjection {
        String getName();

        String getOperationalEncounterTypeName();
    }
}
