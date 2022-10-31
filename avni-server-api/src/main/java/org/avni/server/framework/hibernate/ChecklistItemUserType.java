package org.avni.server.framework.hibernate;

import org.avni.server.domain.ChecklistItemStatus;

public class ChecklistItemUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ChecklistItemStatus.class;
    }
}
