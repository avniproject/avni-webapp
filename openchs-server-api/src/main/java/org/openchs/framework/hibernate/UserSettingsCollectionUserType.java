package org.openchs.framework.hibernate;

import org.openchs.domain.UserSettingsCollection;

public class UserSettingsCollectionUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return UserSettingsCollection.class;
    }
}