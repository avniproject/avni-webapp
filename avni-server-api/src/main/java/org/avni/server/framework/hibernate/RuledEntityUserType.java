package org.avni.server.framework.hibernate;

import org.avni.server.domain.RuledEntity;

public class RuledEntityUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return RuledEntity.class;
    }
}
