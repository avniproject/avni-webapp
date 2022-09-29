package org.avni.server.projection;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.avni.server.application.projections.BaseProjection;
import org.avni.server.domain.*;
import org.joda.time.LocalDate;
import org.avni.server.geo.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Set;

@Projection(name = "IndividualWebProjection", types = {Individual.class})
public interface IndividualWebProjection extends BaseProjection {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate getDateOfBirth();

    Set<Encounter.EncounterProjectionMinimal> getEncounters();

    Set<ProgramEnrolmentProjection> getProgramEnrolments();

    ObservationCollection getObservations();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate getRegistrationDate();

    String getFirstName();

    String getMiddleName();

    String getLastName();

    @Value("#{target.getFirstName() + (target.getMiddleName() != null ? ' ' + target.getMiddleName(): '') + (target.getLastName() != null ? ' ' + target.getLastName(): '')}")
    String getFullName();

    Point getRegistrationLocation();

    List<Program.ProgramProjection> getActivePrograms();

    SubjectType.SubjectTypeProjection getSubjectType();

    Gender.GenderProjection getGender();

    AddressLevel.AddressLevelProjection getAddressLevel();

}
