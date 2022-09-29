package org.avni.server.framework.hibernate;

import org.avni.server.domain.DeclarativeRule;

public class DeclarativeRuleUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return DeclarativeRule.class;
    }
}
