package org.avni.projection;

import org.avni.application.projections.BaseProjection;
import org.avni.domain.*;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

@Projection(name = "UserWebProjection", types = {User.class})
public interface UserWebProjection extends BaseProjection {
    String getUsername();

    String getName();

    Long getOrganisationId();

    String getEmail();

    String getPhoneNumber();

    Long getId();

    String getUuid();

    List<UserGroup> getUserGroups();
}
