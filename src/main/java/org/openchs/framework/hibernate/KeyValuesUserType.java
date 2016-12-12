package org.openchs.framework.hibernate;

import org.openchs.domain.ObservationCollection;

public class KeyValuesUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ObservationCollection.class;
    }
}