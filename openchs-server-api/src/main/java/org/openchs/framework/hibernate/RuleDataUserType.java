package org.openchs.framework.hibernate;

import org.openchs.domain.RuleData;

public class RuleDataUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return RuleData.class;
    }
}
