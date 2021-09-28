package org.avni.framework.hibernate;

import org.avni.domain.ChecklistItemStatus;

public class ChecklistItemUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ChecklistItemStatus.class;
    }
}
