package org.openchs.projection;

import org.joda.time.LocalDate;
import org.openchs.domain.Facility;
import org.openchs.domain.Individual;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.geo.Point;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;
import java.util.Set;


@Projection(name = "individualInfo", types = {Individual.class})
public interface IndividualInfoProjection {
    Long getId();

    String getUuid();

    int getVersion();

    Long getAuditId();

    Long getOrganisationId();

    LocalDate getDateOfBirth();

    Map<String, Object> getEncounterInfo();

    Set<ProgramEnrolment> getProgramEnrolments();

    ObservationCollection getObservations();

    LocalDate getRegistrationDate();

    String getFirstName();

    String getLastName();

    Facility getFacility();

    Point getRegistrationLocation();

    List<Long> getActivePrograms();

    Long getSubjectTypeId();

    Long getGenderId();

    Long getAddressLevelId();
}
