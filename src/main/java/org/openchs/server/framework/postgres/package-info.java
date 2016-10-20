@org.hibernate.annotations.TypeDefs({
        @org.hibernate.annotations.TypeDef(name = "KeyValuesJson", typeClass = KeyValuePairsHibernateObject.class),
        @org.hibernate.annotations.TypeDef(name = "ProgramEncountersJson", typeClass = ProgramEncountersHibernateObject.class)
})

package org.openchs.server.framework.postgres;

import org.openchs.server.framework.hibernate.KeyValuePairsHibernateObject;
import org.openchs.server.framework.hibernate.ProgramEncountersHibernateObject;
