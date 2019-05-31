package org.openchs.framework.hibernate;

import org.openchs.domain.RuledEntity;

public class RuledEntityUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return RuledEntity.class;
    }
}
