package org.avni.framework.hibernate;

import org.avni.domain.DeclarativeRule;

public class DeclarativeRuleUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return DeclarativeRule.class;
    }
}
