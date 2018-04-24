package org.openchs.framework.hibernate;

import org.openchs.domain.programConfig.VisitScheduleConfig;

public class VisitScheduleConfigUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return VisitScheduleConfig.class;
    }
}
