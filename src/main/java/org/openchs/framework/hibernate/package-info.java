@org.hibernate.annotations.TypeDefs({
        @org.hibernate.annotations.TypeDef(name = "KeyValuesJson", typeClass = ObservationCollectionUserType.class),
        @org.hibernate.annotations.TypeDef(name = "ProgramEncountersJson", typeClass = ProgramEncountersHibernateObject.class)
})

package org.openchs.framework.hibernate;