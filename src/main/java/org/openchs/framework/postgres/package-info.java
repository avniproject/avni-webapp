@org.hibernate.annotations.TypeDefs({
        @org.hibernate.annotations.TypeDef(name = "KeyValuesJson", typeClass = KeyValuePairsHibernateObject.class),
        @org.hibernate.annotations.TypeDef(name = "ProgramEncountersJson", typeClass = ProgramEncountersHibernateObject.class)
})

package org.openchs.framework.postgres;

import org.openchs.framework.hibernate.ProgramEncountersHibernateObject;
import org.openchs.framework.hibernate.KeyValuePairsHibernateObject;
