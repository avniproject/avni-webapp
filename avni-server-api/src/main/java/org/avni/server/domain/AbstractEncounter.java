package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.avni.server.geo.Point;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Objects;

@MappedSuperclass
public class AbstractEncounter extends SyncAttributeEntity {
    @Column
    private String name;
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "encounter_type_id")
    private EncounterType encounterType;
    @Column
    private DateTime earliestVisitDateTime;
    @Column
    private DateTime maxVisitDateTime;
    @Column
    private DateTime encounterDateTime;
    @Column
    @Type(type = "observations")
    private ObservationCollection observations;
    @Column
    private DateTime cancelDateTime;
    @Column
    @Type(type = "observations")
    private ObservationCollection cancelObservations;
    @Type(type = "org.avni.server.geo.PointType")
    @Column
    private Point encounterLocation;
    @Type(type = "org.avni.server.geo.PointType")
    @Column
    private Point cancelLocation;
    @Column
    private String legacyId;

    @Column(name = "address_id")
    private Long addressId;

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

    public Point getEncounterLocation() {
        return encounterLocation;
    }

    public void setEncounterLocation(Point encounterLocation) {
        this.encounterLocation = encounterLocation;
    }

    public Point getCancelLocation() {
        return cancelLocation;
    }

    public void setCancelLocation(Point cancelLocation) {
        this.cancelLocation = cancelLocation;
    }

    public boolean isCompleted() {
        return getEncounterDateTime() != null;
    }

    public boolean matches(String encounterTypeName, String encounterName) {
        return Objects.equals(this.getEncounterType().getName(), encounterTypeName) && Objects.equals(this.getName(), encounterName);
    }

    public boolean dateFallsWithIn(DateTime encounterDateTime) {
        return encounterDateTime.isAfter(this.getEarliestVisitDateTime()) && encounterDateTime.isBefore(this.getMaxVisitDateTime());
    }

    public boolean isEncounteredOrCancelledBetween(DateTime startDate, DateTime endDate) {
        return (getEncounterDateTime() != null && isAfterOrEqual(getEncounterDateTime(), startDate) && isBeforeOrEqual(getEncounterDateTime(), endDate)) ||
                (getCancelDateTime() != null && isAfterOrEqual(getCancelDateTime(), startDate) && isBeforeOrEqual(getCancelDateTime(), endDate));
    }

    private boolean isAfterOrEqual(DateTime d1, DateTime d2) {
        return d1.equals(d2) || d1.isAfter(d2);
    }

    private boolean isBeforeOrEqual(DateTime d1, DateTime d2) {
        return d1.equals(d2) || d1.isBefore(d2);
    }

    public String getLegacyId() {
        return legacyId;
    }

    public void setLegacyId(String legacyId) {
        this.legacyId = legacyId;
    }

    public void validate() throws ValidationException {
        if (encounterDateTime == null && earliestVisitDateTime == null) {
            throw new ValidationException("Both encounter datetime and earliest visit datetime cannot be null");
        }
    }

    @JsonIgnore
    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

}
