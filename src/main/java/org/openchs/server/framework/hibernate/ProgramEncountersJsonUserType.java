package org.openchs.server.framework.hibernate;

public class ProgramEncountersJsonUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ProgramEncountersHibernateObject.class;
    }
}