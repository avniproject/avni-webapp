package org.avni.exporter.v2;

import org.avni.web.request.export.ExportEntityType;
import org.avni.web.request.export.ExportOutput;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class ExportV2ValidationHelper implements LongitudinalExportRequestFieldNameConstants{
    private final static Pattern UUID_REGEX_PATTERN =
            Pattern.compile("^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$");

    private static List<String> validRegistrationFields = Arrays.asList(
            ID,
            UUID,
            FIRST_NAME,
            MIDDLE_NAME,
            LAST_NAME,
            DATE_OF_BIRTH,
            REGISTRATION_DATE,
            GENDER,
            CREATED_BY,
            CREATED_DATE_TIME,
            LAST_MODIFIED_BY,
            LAST_MODIFIED_DATE_TIME,
            VOIDED);

    private static List<String> validEnrolmentFields = Arrays.asList(
            ID,
            UUID,
            ENROLMENT_DATE_TIME,
            PROGRAM_EXIT_DATE_TIME,
            CREATED_BY,
            CREATED_DATE_TIME,
            LAST_MODIFIED_BY,
            LAST_MODIFIED_DATE_TIME,
            VOIDED);


    private static List<String> validEncounterFields = Arrays.asList(
            ID,
            UUID,
            NAME,
            EARLIEST_VISIT_DATE_TIME,
            MAX_VISIT_DATE_TIME,
            ENCOUNTER_DATE_TIME,
            CANCEL_DATE_TIME,
            CREATED_BY,
            CREATED_DATE_TIME,
            LAST_MODIFIED_BY,
            LAST_MODIFIED_DATE_TIME,
            VOIDED);

    private void validateFields(List<String> errorList, String entityName, List<String> requestFields, List<String> allowedFields) {
        requestFields.removeAll(allowedFields);
        String invalidFields = requestFields.stream().filter(this::isNotUUID).collect(Collectors.joining(","));
        if(StringUtils.hasText(invalidFields)) {
            errorList.add("Invalid fields specified for "+ entityName+" : "+invalidFields);
        }
    }

    private boolean isNotUUID(String str) {
        if (!StringUtils.hasText(str)) {
            return false;
        }
        return !UUID_REGEX_PATTERN.matcher(str).matches();
    }

    public void validateRegistrationHeaders(List<String> errorList, String entityName, List<String> requestFields) {
        validateFields(errorList, entityName, requestFields, validRegistrationFields);
    }

    public void validateEncounterHeaders(List<String> errorList, String entityName, List<String> requestFields) {
        validateFields(errorList, entityName, requestFields, validEncounterFields);
    }

    public void validateEnrolmentHeaders(List<String> errorList, String entityName, List<String> requestFields) {
        validateFields(errorList, entityName, requestFields, validEnrolmentFields);
    }

    public boolean validateIfDateFilterIsNotSpecified(ExportEntityType entityType) {
        return entityType.isDateEmpty();
    }

    public List<String> validate(ExportOutput exportOutput) {
        List<String> errorList = new ArrayList<>();
        if(validateIfDateFilterIsNotSpecified(exportOutput)) {
            errorList.add("Individual Registration Date isn't specified");
        }
        validateRegistrationHeaders(errorList, "Individual", exportOutput.getFields());

        exportOutput.getEncounters().forEach(enc -> {
            validateEncounterHeaders(errorList, "Encounter", enc.getFields());
        });

        exportOutput.getPrograms().forEach(enr -> {
            validateEnrolmentHeaders(errorList, "Program Enrolments", enr.getFields());
        });

        exportOutput.getPrograms().stream().flatMap(enr -> enr.getEncounters().stream()).forEach(enc -> {
            validateEncounterHeaders(errorList, "Program Encounter", enc.getFields());
        });

        exportOutput.getGroups().forEach(grp -> {
                    validateRegistrationHeaders(errorList, "Group Subject", grp.getFields());
        });

        exportOutput.getGroups().stream().flatMap(grp -> grp.getEncounters().stream()).forEach(enc -> {
            validateEncounterHeaders(errorList, "Group Subject Encounter", enc.getFields());
        });

        return errorList;
    }
}
