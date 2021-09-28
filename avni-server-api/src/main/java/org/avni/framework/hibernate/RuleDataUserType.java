package org.avni.framework.hibernate;

import org.avni.domain.RuleData;

public class RuleDataUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return RuleData.class;
    }
}
