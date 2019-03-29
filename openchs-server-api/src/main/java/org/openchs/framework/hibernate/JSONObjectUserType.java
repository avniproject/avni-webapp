package org.openchs.framework.hibernate;

import org.openchs.domain.JsonObject;

public class JSONObjectUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return JsonObject.class;
    }
}