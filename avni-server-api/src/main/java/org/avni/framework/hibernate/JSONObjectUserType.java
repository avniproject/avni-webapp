package org.avni.framework.hibernate;

import org.avni.domain.JsonObject;

public class JSONObjectUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return JsonObject.class;
    }
}
