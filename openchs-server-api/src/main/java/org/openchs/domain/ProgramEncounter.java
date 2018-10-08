package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "program_encounter")
@JsonIgnoreProperties({"programEnrolment"})
public class ProgramEncounter extends OrganisationAwareEntity {
    @Column
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "encounter_type_id")
    private EncounterType encounterType;

    @Column
    private DateTime encounterDateTime;

    @Column
    private DateTime earliestVisitDateTime;

    @Column
    private DateTime maxVisitDateTime;

    @Column
    @Type(type = "observations")
    private ObservationCollection observations;

    @Column
    private DateTime cancelDateTime;

    @Column
    @Type(type = "observations")
    private ObservationCollection cancelObservations;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_enrolment_id")
    private ProgramEnrolment programEnrolment;

    public EncounterType getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    public DateTime getEncounterDateTime() {
        return encounterDateTime;
    }

    public void setEncounterDateTime(DateTime encounterDateTime) {
        this.encounterDateTime = encounterDateTime;
    }

    public ProgramEnrolment getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(ProgramEnrolment programEnrolment) {
        this.programEnrolment = programEnrolment;
    }

    public ObservationCollection getObservations() {
        return observations;
    }

    public void setObservations(ObservationCollection observations) {
        this.observations = observations;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DateTime getEarliestVisitDateTime() {
        return earliestVisitDateTime;
    }

    public void setEarliestVisitDateTime(DateTime earliestVisitDateTime) {
        this.earliestVisitDateTime = earliestVisitDateTime;
    }

    public DateTime getMaxVisitDateTime() {
        return maxVisitDateTime;
    }

    public void setMaxVisitDateTime(DateTime maxVisitDateTime) {
        this.maxVisitDateTime = maxVisitDateTime;
    }

    public DateTime getCancelDateTime() {
        return cancelDateTime;
    }

    public void setCancelDateTime(DateTime cancelDateTime) {
        this.cancelDateTime = cancelDateTime;
    }

    public ObservationCollection getCancelObservations() {
        return cancelObservations;
    }

    public void setCancelObservations(ObservationCollection cancelObservations) {
        this.cancelObservations = cancelObservations;
    }

    public boolean matches(String encounterTypeName, String encounterName) {
        return Objects.equals(this.encounterType.getName(), encounterTypeName) && Objects.equals(this.name, encounterName);
    }

    public boolean dateFallsWithIn(DateTime encounterDateTime) {
        return encounterDateTime.isAfter(this.earliestVisitDateTime) && encounterDateTime.isBefore(this.maxVisitDateTime);
    }
}