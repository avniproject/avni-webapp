package org.openchs.projection;

import org.joda.time.DateTime;
import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.*;
import org.springframework.data.rest.core.config.Projection;

import java.util.Set;

@Projection(name = "UserWebProjection", types = {User.class})
public interface UserWebProjection extends BaseProjection {
    String getUsername();

    String getName();

    Long getOrganisationId();

    String getEmail();

    String getPhoneNumber();

    Catchment getCatchment();

    Set<UserFacilityMapping.UserFacilityMappingProjection> getUserFacilityMappings();

    DateTime getCreatedDateTime();

    DateTime getLastModifiedDateTime();

    String[] getRoles();

    boolean isAdmin();

    boolean isOrgAdmin();

    OperatingIndividualScope getOperatingIndividualScope();

    JsonObject getSettings();
}
