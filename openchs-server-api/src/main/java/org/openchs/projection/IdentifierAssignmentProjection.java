package org.openchs.projection;

import org.openchs.domain.IdentifierAssignment;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "IdentifierAssignmentProjection", types = {IdentifierAssignment.class})
public interface IdentifierAssignmentProjection {
    String getUuid();
    String getIdentifier();
    IdentifierSourceProjection getIdentifierSource();
}