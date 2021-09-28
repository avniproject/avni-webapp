package org.avni.framework.hibernate;

import org.avni.domain.ObservationCollection;

public class ObservationCollectionUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ObservationCollection.class;
    }
}
