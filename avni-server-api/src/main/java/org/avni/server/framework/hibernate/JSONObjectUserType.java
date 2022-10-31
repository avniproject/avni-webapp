package org.avni.server.framework.hibernate;

import org.avni.server.domain.JsonObject;

public class JSONObjectUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return JsonObject.class;
    }
}
