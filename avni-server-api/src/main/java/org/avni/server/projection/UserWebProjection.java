package org.avni.server.projection;

import org.avni.server.application.projections.BaseProjection;
import org.avni.server.domain.User;
import org.avni.server.domain.UserGroup;
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
