package org.openchs.server.framework.hibernate;

public class KeyValuePairsJsonUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return KeyValuePairsHibernateObject.class;
    }
}