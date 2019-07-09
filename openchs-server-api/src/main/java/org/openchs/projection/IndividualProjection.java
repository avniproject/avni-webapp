package org.openchs.projection;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.joda.time.LocalDate;
import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.Facility;
import org.openchs.domain.Gender.GenderProjection;
import org.openchs.domain.Individual;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.Program.ProgramProjection;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.domain.SubjectType.SubjectTypeProjection;
import org.openchs.geo.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.openchs.domain.AddressLevel.AddressLevelProjection;

@Projection(name = "IndividualProjection", types = {Individual.class})
public interface IndividualProjection extends BaseProjection {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate getDateOfBirth();

    Map<String, Object> getEncounterInfo();

    Set<ProgramEnrolment> getProgramEnrolments();

    ObservationCollection getObservations();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate getRegistrationDate();

    String getFirstName();

    String getLastName();

    @Value("#{target.getFirstName() + ' ' + target.getLastName()}")
    String getFullName();

    Facility getFacility();

    Point getRegistrationLocation();

    List<ProgramProjection> getActivePrograms();

    SubjectTypeProjection getSubjectType();

    GenderProjection getGender();

    AddressLevelProjection getAddressLevel();

}
