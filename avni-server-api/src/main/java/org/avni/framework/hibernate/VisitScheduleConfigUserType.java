package org.avni.framework.hibernate;

import org.avni.domain.programConfig.VisitScheduleConfig;

public class VisitScheduleConfigUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return VisitScheduleConfig.class;
    }
}
