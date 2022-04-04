package org.avni.dao;

import org.avni.domain.JsonObject;
import org.avni.domain.SubjectType;
import org.joda.time.DateTime;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;

import static org.avni.dao.SyncParameters.SyncEntityName.Individual;

public class SyncParameters {
    private final DateTime lastModifiedDateTime;
    private final DateTime now;
    private final Long typeId;
    private final Pageable pageable;
    private List<Long> addressLevels;
    private SubjectType subjectType;
    private JsonObject syncSettings;
    private SyncEntityName syncEntityName;

    public SyncParameters(DateTime lastModifiedDateTime,
                          DateTime now, Long typeId,
                          Pageable pageable,
                          List<Long> addressLevels,
                          SubjectType subjectType,
                          JsonObject syncSettings,
                          SyncEntityName syncEntityName) {
        this.lastModifiedDateTime = lastModifiedDateTime;
        this.now = now;
        this.typeId = typeId;
        this.pageable = pageable;
        this.addressLevels = addressLevels;
        this.subjectType = subjectType;
        this.syncSettings = syncSettings;
        this.syncEntityName = syncEntityName;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public DateTime getNow() {
        return now;
    }

    public Long getTypeId() {
        return typeId;
    }

    public Pageable getPageable() {
        return pageable;
    }

    public List<Long> getAddressLevels() {
        return addressLevels;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public JsonObject getSyncSettings() {
        return syncSettings;
    }

    public boolean isParentOrSelfIndividual() {
        return Arrays.asList(SyncEntityName.Individual, SyncEntityName.Comment, SyncEntityName.CommentThread).contains(syncEntityName);
    }

    public boolean isEncounter() {
        return syncEntityName.equals(SyncEntityName.Encounter);
    }

    public boolean isParentOrSelfEnrolment() {
        return Arrays.asList(SyncEntityName.Enrolment, SyncEntityName.Checklist, SyncEntityName.ChecklistItem).contains(syncEntityName);
    }

    public enum SyncEntityName {
        Individual,
        Enrolment,
        Encounter,
        ProgramEncounter,
        ChecklistItem,
        Checklist,
        Comment,
        CommentThread,
        IndividualRelationShip,
        LocationMapping,
        Location,
        SubjectMigration,
        GroupSubject
    }
}
