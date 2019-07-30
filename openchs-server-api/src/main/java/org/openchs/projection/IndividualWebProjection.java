package org.openchs.projection;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.joda.time.LocalDate;
import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.*;
import org.openchs.domain.Encounter.EncounterProjectionMinimal;
import org.openchs.domain.Gender.GenderProjection;
import org.openchs.domain.Program.ProgramProjection;
import org.openchs.domain.SubjectType.SubjectTypeProjection;
import org.openchs.geo.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Set;

import static org.openchs.domain.AddressLevel.AddressLevelProjection;

@Projection(name = "IndividualWebProjection", types = {Individual.class})
public interface IndividualWebProjection extends BaseProjection {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate getDateOfBirth();

    Set<EncounterProjectionMinimal> getEncounters();

    Set<ProgramEnrolmentProjection> getProgramEnrolments();

    ObservationCollection getObservations();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate getRegistrationDate();

    String getFirstName();

    String getLastName();

    @Value("#{target.getFirstName() + (target.getLastName() != null ? ' ' + target.getLastName(): '')}")
    String getFullName();

    Facility getFacility();

    Point getRegistrationLocation();

    List<ProgramProjection> getActivePrograms();

    SubjectTypeProjection getSubjectType();

    GenderProjection getGender();

    AddressLevelProjection getAddressLevel();

}
