package org.avni.framework.hibernate;

import org.avni.application.KeyValues;

public class KeyValuesUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return KeyValues.class;
    }
}
