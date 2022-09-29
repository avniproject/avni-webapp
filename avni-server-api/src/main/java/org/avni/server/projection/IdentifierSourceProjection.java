package org.avni.server.projection;

import org.avni.server.domain.IdentifierSource;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "IdentifierSourceProjection", types = {IdentifierSource.class})
public interface IdentifierSourceProjection {
    String getUuid();
    String getName();
}
