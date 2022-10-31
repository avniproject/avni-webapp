package org.avni.server.projection;

import org.avni.server.application.projections.BaseProjection;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.domain.Program;
import org.avni.server.domain.ProgramEncounter;
import org.avni.server.domain.ProgramEnrolment;
import org.joda.time.DateTime;
import org.avni.server.geo.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.Set;

@Projection(name = "ProgramEnrolmentProjection", types = {ProgramEnrolment.class})
public interface ProgramEnrolmentProjection extends BaseProjection {

    @Value("#{target.individual.uuid}")
    String getSubjectUuid();

    Program.ProgramProjection getProgram();

    Set<ProgramEncounter.ProgramEncounterProjectionMinimal> getProgramEncounters();

    DateTime getEnrolmentDateTime();

    ObservationCollection getObservations();

    DateTime getProgramExitDateTime();

    Point getEnrolmentLocation();

    Point getExitLocation();

    ObservationCollection getProgramExitObservations();

}
