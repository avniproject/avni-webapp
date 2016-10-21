package org.openchs.framework.hibernate;

public class ProgramEncountersJsonUserType extends AbstractJsonbUserType {
    @Override
    public Class returnedClass() {
        return ProgramEncountersHibernateObject.class;
    }
}