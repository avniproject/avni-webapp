package org.avni.service;

import org.avni.application.FormType;

public class FormMappingParameterObject {
    public String subjectTypeUuid;
    public String programUuid;
    public String encounterTypeUuid;

    public FormMappingParameterObject(String subjectTypeUuid, String programUuid, String encounterTypeUuid) {
        this.subjectTypeUuid = subjectTypeUuid;
        this.programUuid = programUuid;
        this.encounterTypeUuid = encounterTypeUuid;
    }
}
