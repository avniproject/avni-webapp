package org.avni.web.request;

import org.avni.domain.SyncableItem;
import org.hibernate.boot.model.source.internal.hbm.EmbeddableSourceContainer;
import org.joda.time.DateTime;
import org.avni.application.Subject;
import org.avni.domain.GroupPrivilege;
import org.avni.domain.SubjectType;

import java.util.*;
import java.util.stream.Collectors;

public class EntitySyncStatusContract {
    private static final DateTime REALLY_OLD_DATE = new DateTime("1900-01-01T00:00:00.000Z");
    private static final Map<String, List<String>> privilegeTypeToEntityNameMap = new HashMap<String, List<String>>() {{
        put("Encounter", Collections.singletonList("Encounter"));
        put("Program", Collections.singletonList("ProgramEnrolment"));
        put("ProgramEncounter", Collections.singletonList("ProgramEncounter"));
        put("ChecklistDetail", Arrays.asList("Checklist", "ChecklistItem"));
    }};
    private String uuid;
    private String entityName;
    private DateTime loadedSince;
    private String entityTypeUuid;

    public static List<EntitySyncStatusContract> addFromPrivilege(GroupPrivilege groupPrivilege, boolean isCommentEnabled) {
        if (groupPrivilege.isEncounterPrivilege()) {
            return addForTypeUUID(groupPrivilege.getTypeUUID(), "Encounter");
        } else if (groupPrivilege.isProgramPrivilege()) {
            return addForTypeUUID(groupPrivilege.getTypeUUID(), "Program");
        } else if (groupPrivilege.isProgramEncounterPrivilege()) {
            return addForTypeUUID(groupPrivilege.getTypeUUID(), "ProgramEncounter");
        } else if (groupPrivilege.isChecklistPrivilege()) {
            return addForTypeUUID(groupPrivilege.getTypeUUID(), "Checklist");
        } else {
            return addForSubjectType(groupPrivilege.getSubjectType(), isCommentEnabled);
        }
    }

    public static EntitySyncStatusContract create(String entityName, String entityTypeUuid) {
        EntitySyncStatusContract contract = new EntitySyncStatusContract();
        contract.setUuid(UUID.randomUUID().toString());
        contract.setLoadedSince(REALLY_OLD_DATE);
        contract.setEntityName(entityName);
        contract.setEntityTypeUuid(entityTypeUuid);
        return contract;
    }

    public static List<EntitySyncStatusContract> addForTypeUUID(String typeUUID, String privilegeType) {
        List<String> entityTypes = privilegeTypeToEntityNameMap.get(privilegeType);
        return entityTypes.stream().map(entityName -> {
            EntitySyncStatusContract entitySyncStatusContract = new EntitySyncStatusContract();
            entitySyncStatusContract.setEntityName(entityName);
            entitySyncStatusContract.setLoadedSince(REALLY_OLD_DATE);
            entitySyncStatusContract.setUuid(UUID.randomUUID().toString());
            entitySyncStatusContract.setEntityTypeUuid(typeUUID);
            return entitySyncStatusContract;
        }).collect(Collectors.toList());
    }

    public static List<EntitySyncStatusContract> addForSubjectType(SubjectType subjectType, boolean isCommentEnabled) {
        List<String> entityTypes = new ArrayList<>();
        entityTypes.add("Individual");
        if (subjectType.isGroup()) {
            entityTypes.add("GroupSubject");
        }
        if (subjectType.getType().equals(Subject.Person)) {
            entityTypes.add("IndividualRelationship");
        }
        if (isCommentEnabled) {
            entityTypes.add("Comment");
            entityTypes.add("CommentThread");
        }
        entityTypes.add("SubjectMigration");
        return entityTypes.stream().map(entityName -> {
            EntitySyncStatusContract entitySyncStatusContract = new EntitySyncStatusContract();
            entitySyncStatusContract.setEntityName(entityName);
            entitySyncStatusContract.setLoadedSince(REALLY_OLD_DATE);
            entitySyncStatusContract.setUuid(UUID.randomUUID().toString());
            entitySyncStatusContract.setEntityTypeUuid(subjectType.getUuid());
            return entitySyncStatusContract;
        }).collect(Collectors.toList());
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public DateTime getLoadedSince() {
        return loadedSince;
    }

    public void setLoadedSince(DateTime loadedSince) {
        this.loadedSince = loadedSince;
    }

    public String getEntityTypeUuid() {
        return entityTypeUuid;
    }

    public void setEntityTypeUuid(String entityTypeUuid) {
        this.entityTypeUuid = entityTypeUuid;
    }

    public boolean matchesEntity(SyncableItem syncableItem) {
        return syncableItem.getName().equals(this.entityName) && syncableItem.getEntityTypeUuid().equals(this.entityTypeUuid);
    }
}
