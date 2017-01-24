package org.openchs.framework.hibernate;

import org.openchs.application.KeyValues;

public class KeyValuesUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return KeyValues.class;
    }
}