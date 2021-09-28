package org.avni.framework.hibernate;

import org.avni.domain.RuledEntity;

public class RuledEntityUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return RuledEntity.class;
    }
}
