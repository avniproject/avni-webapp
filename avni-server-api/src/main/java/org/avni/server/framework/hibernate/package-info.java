@org.hibernate.annotations.TypeDefs({
        @org.hibernate.annotations.TypeDef(name = "observations", typeClass = ObservationCollectionUserType.class),
        @org.hibernate.annotations.TypeDef(name = "ruleData", typeClass = RuleDataUserType.class),
        @org.hibernate.annotations.TypeDef(name = "keyValues", typeClass = KeyValuesUserType.class),
        @org.hibernate.annotations.TypeDef(name = "visitSchedules", typeClass = VisitScheduleConfigUserType.class),
        @org.hibernate.annotations.TypeDef(name = "status", typeClass = ChecklistItemUserType.class),
        @org.hibernate.annotations.TypeDef(name = "jsonObject", typeClass = JSONObjectUserType.class),
        @org.hibernate.annotations.TypeDef(name = "ruledEntity", typeClass = RuledEntityUserType.class),
        @org.hibernate.annotations.TypeDef(name = "declarativeRule", typeClass = DeclarativeRuleUserType.class),
        @org.hibernate.annotations.TypeDef(name = "metadataSearchFields", typeClass = ArrayUserType.class)
})

package org.avni.server.framework.hibernate;

