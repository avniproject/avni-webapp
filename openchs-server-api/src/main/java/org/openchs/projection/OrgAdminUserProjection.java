package org.openchs.projection;

import org.openchs.domain.User;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "OrgAdminUserProjection", types = {User.class})
public interface OrgAdminUserProjection {
    Long getId();

    String getName();

    String getUsername();

    String getEmail();

    String getPhoneNumber();

    Long getOrganisationId();

    boolean isDisabledInCognito();
}
