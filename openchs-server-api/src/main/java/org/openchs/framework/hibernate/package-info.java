@org.hibernate.annotations.TypeDefs({
        @org.hibernate.annotations.TypeDef(name = "observations", typeClass = ObservationCollectionUserType.class),
        @org.hibernate.annotations.TypeDef(name = "ruleData", typeClass = RuleDataUserType.class),
        @org.hibernate.annotations.TypeDef(name = "keyValues", typeClass = KeyValuesUserType.class),
        @org.hibernate.annotations.TypeDef(name = "visitSchedules", typeClass = VisitScheduleConfigUserType.class)
})

package org.openchs.framework.hibernate;