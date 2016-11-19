package org.openchs.framework.hibernate;

import org.openchs.domain.ObservationCollection;

public class ObservationCollectionUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ObservationCollection.class;
    }
}