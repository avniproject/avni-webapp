package org.avni.server.framework.hibernate;

import org.avni.server.domain.ObservationCollection;

public class ObservationCollectionUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ObservationCollection.class;
    }
}
