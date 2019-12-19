package org.openchs.projection;

import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.JsonObject;
import org.openchs.domain.OrganisationConfig;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "OrganisationConfigProjection", types = {OrganisationConfig.class})
public interface OrganisationConfigProjection  extends BaseProjection {

    public JsonObject getSettings();

}
