package org.openchs.builder;

import org.joda.time.DateTime;
import org.openchs.domain.User;
import org.openchs.domain.UserSettings;
import org.openchs.domain.Video;
import org.openchs.domain.VideoTelemetric;

public class UserSettingsBuilder extends BaseBuilder<UserSettings, UserSettingsBuilder> {
    public UserSettingsBuilder(UserSettings existing) {
        super(existing, new UserSettings());
    }


    public UserSettingsBuilder withUser(User user) {
        set(get()::setUser, user);
        return this;
    }

    public UserSettingsBuilder withOrganisationId(Long organisationId) {
        set(get()::setOrganisationId, organisationId);
        return this;
    }
}
