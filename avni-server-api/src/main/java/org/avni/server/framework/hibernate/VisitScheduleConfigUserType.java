package org.avni.server.framework.hibernate;

import org.avni.server.domain.programConfig.VisitScheduleConfig;

public class VisitScheduleConfigUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return VisitScheduleConfig.class;
    }
}
