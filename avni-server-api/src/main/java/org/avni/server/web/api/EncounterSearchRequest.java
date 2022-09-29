package org.avni.server.web.api;

import org.avni.server.domain.Concept;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.Map;

public class EncounterSearchRequest {
    private Date lastModifiedDateTime;
    private Date now;
    private String encounterType;
    String subjectUUID;
    private Map<Concept, String> conceptsMap;
    private Pageable pageable;

    public EncounterSearchRequest(Date lastModifiedDateTime, Date now, String encounterType, String subjectUUID, Map<Concept, String> conceptsMap, Pageable pageable) {
        this.lastModifiedDateTime = lastModifiedDateTime;
        this.now = now;
        this.encounterType = encounterType;
        this.subjectUUID = subjectUUID;
        this.conceptsMap = conceptsMap;
        this.pageable = pageable;
    }

    public Date getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public Date getNow() {
        return now;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public String getSubjectUUID() {
        return subjectUUID;
    }

    public Map<Concept, String> getConceptsMap() {
        return conceptsMap;
    }

    public Pageable getPageable() {
        return pageable;
    }
}
