package org.openchs.projection;

import org.joda.time.DateTime;
import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.Program.ProgramProjection;
import org.openchs.domain.ProgramEncounter.ProgramEncounterProjectionMinimal;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.geo.Point;
import org.springframework.data.rest.core.config.Projection;

import java.util.Set;

@Projection(name = "ProgramEnrolmentProjection", types = {ProgramEnrolment.class})
public interface ProgramEnrolmentProjection extends BaseProjection {

    ProgramProjection getProgram();

    Set<ProgramEncounterProjectionMinimal> getProgramEncounters();

    DateTime getEnrolmentDateTime();

    ObservationCollection getObservations();

    DateTime getProgramExitDateTime();

    Point getEnrolmentLocation();

    Point getExitLocation();

    ObservationCollection getProgramExitObservations();

}
