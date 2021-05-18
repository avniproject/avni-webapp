package org.openchs.projection;

import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.*;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "UserWebProjection", types = {User.class})
public interface UserWebProjection extends BaseProjection {
    String getUsername();

    String getName();

    Long getOrganisationId();

    String getEmail();

    String getPhoneNumber();
}
