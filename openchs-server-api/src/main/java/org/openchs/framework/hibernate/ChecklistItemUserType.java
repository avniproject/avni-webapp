package org.openchs.framework.hibernate;

import org.openchs.domain.ChecklistItemStatus;

public class ChecklistItemUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ChecklistItemStatus.class;
    }
}
