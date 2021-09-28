package org.avni.projection;

import org.joda.time.DateTime;
import org.avni.application.projections.BaseProjection;
import org.avni.domain.ObservationCollection;
import org.avni.domain.Program.ProgramProjection;
import org.avni.domain.ProgramEncounter.ProgramEncounterProjectionMinimal;
import org.avni.domain.ProgramEnrolment;
import org.avni.geo.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.Set;

@Projection(name = "ProgramEnrolmentProjection", types = {ProgramEnrolment.class})
public interface ProgramEnrolmentProjection extends BaseProjection {

    @Value("#{target.individual.uuid}")
    String getSubjectUuid();

    ProgramProjection getProgram();

    Set<ProgramEncounterProjectionMinimal> getProgramEncounters();

    DateTime getEnrolmentDateTime();

    ObservationCollection getObservations();

    DateTime getProgramExitDateTime();

    Point getEnrolmentLocation();

    Point getExitLocation();

    ObservationCollection getProgramExitObservations();

}
