package org.avni.server.projection;

import org.avni.server.domain.IdentifierAssignment;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "IdentifierAssignmentProjection", types = {IdentifierAssignment.class})
public interface IdentifierAssignmentProjection {
    String getUuid();
    String getIdentifier();
    IdentifierSourceProjection getIdentifierSource();
}
