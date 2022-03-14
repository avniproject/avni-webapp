package org.avni.service;

import org.avni.application.FormElement;
import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.dao.AddressLevelTypeRepository;
import org.avni.dao.EncounterTypeRepository;
import org.avni.dao.ProgramRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.ConceptDataType;
import org.avni.domain.EncounterType;
import org.avni.domain.Program;
import org.avni.domain.SubjectType;
import org.avni.importer.batch.csv.writer.ProgramEnrolmentWriter;
import org.avni.importer.batch.csv.writer.header.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ImportService {

    private final SubjectTypeRepository subjectTypeRepository;
    private final FormMappingRepository formMappingRepository;
    private static Logger logger = LoggerFactory.getLogger(ProgramEnrolmentWriter.class);
    private ProgramRepository programRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private AddressLevelTypeRepository addressLevelTypeRepository;

    @Autowired
    public ImportService(SubjectTypeRepository subjectTypeRepository, FormMappingRepository formMappingRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, AddressLevelTypeRepository addressLevelTypeRepository) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.formMappingRepository = formMappingRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
    }

    public HashMap<String, String> getImportTypes() {
        List<FormMapping> formMappings = formMappingRepository.findAllOperational();
        Stream<FormMapping> subjectProfileFormMappings = formMappings.stream().filter(formMapping -> formMapping.getForm().getFormType() == FormType.IndividualProfile);
        HashMap<String, String> uploadTypes = new HashMap<>();
        subjectProfileFormMappings.forEach(formMapping -> {
            String subjectName = formMapping.getSubjectType().getName();
            uploadTypes.put(String.format("Subject---%s", subjectName), String.format("%s registration", subjectName));
        });

        Stream<FormMapping> programEnrolmentForms = formMappings.stream().filter(formMapping -> formMapping.getForm().getFormType() == FormType.ProgramEnrolment);
        programEnrolmentForms.forEach(formMapping -> {
            String subjectTypeName = formMapping.getSubjectType().getName();
            String programName = formMapping.getProgram().getName();
            uploadTypes.put(String.format("ProgramEnrolment---%s---%s", programName, subjectTypeName), String.format("%s enrolment", programName));
        });

        Stream<FormMapping> programEncounterForms = formMappings.stream().filter(formMapping -> formMapping.getForm().getFormType() == FormType.ProgramEncounter);
        programEncounterForms.forEach(formMapping -> {
            String subjectTypeName = formMapping.getSubjectType().getName();
            String encounterType = formMapping.getEncounterType().getName();
            String formName = formMapping.getFormName();
            uploadTypes.put(String.format("ProgramEncounter---%s---%s", encounterType, subjectTypeName), String.format("%s", formName));
        });

        Stream<FormMapping> encounterForms = formMappings.stream().filter(formMapping -> formMapping.getForm().getFormType() == FormType.Encounter);
        encounterForms.forEach(formMapping -> {
            String subjectTypeName = formMapping.getSubjectType().getName();
            String encounterType = formMapping.getEncounterType().getName();
            String formName = formMapping.getFormName();
            uploadTypes.put(String.format("Encounter---%s---%s", encounterType, subjectTypeName), String.format("%s", formName));
        });

        Stream<SubjectType.SubjectTypeProjection> groupSubjectTypes = subjectTypeRepository.findAllOperational().stream().filter(subjectType -> subjectType.isGroup());
        groupSubjectTypes.forEach(groupSubjectType -> {
            String groupSubjectTypeName = groupSubjectType.getName();
            uploadTypes.put(String.format("GroupMembers---%s", groupSubjectTypeName), String.format("%s members", groupSubjectTypeName));
        });

        return uploadTypes;
    }

    /**
     * Upload types can be
     *
     * Subject---<SubjectType>
     * ProgramEnrolment---<Program>---<SubjectType>
     * ProgramEncounter---<EncounterType>---<SubjectType>
     * Encounter--<EncounterType>---<SubjectType>
     * GroupMembers---<GroupSubjectTypeName>
     *
     * @param uploadType
     * @return
     */
    public String getSampleFile(String uploadType) {
        String[] uploadSpec = uploadType.split("---");
        String response = "";

        if (uploadSpec[0].equals("Subject")) {
            return getSubjectSampleFile(uploadSpec, response);
        }

        if (uploadSpec[0].equals("ProgramEnrolment")) {
            return getProgramEnrolmentSampleFile(uploadSpec, response);
        }

        if (uploadSpec[0].equals("ProgramEncounter")) {
            return getProgramEncounterSampleFile(uploadSpec, response);
        }

        if (uploadSpec[0].equals("Encounter")) {
            return getEncounterSampleFile(uploadSpec, response);
        }

        if (uploadSpec[0].equals("GroupMembers")) {
            return getGroupMembersSampleFile(uploadSpec, response);
        }

        throw new UnsupportedOperationException(String.format("Sample file format for %s not supported", uploadType));
    }

    private String getEncounterSampleFile(String[] uploadSpec, String response) {
        response = addToResponse(response, Arrays.asList(new EncounterHeaders().getAllHeaders()));
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(getSubjectType(uploadSpec[2]).getUuid(), null, getEncounterType(uploadSpec[1]).getUuid(), FormType.Encounter);
        return addToResponse(response, formMapping);
    }

    private String getSubjectSampleFile(String[] uploadSpec, String response) {
        response = addToResponse(response, Arrays.asList(new SubjectHeaders().getAllHeaders()));
        response = addToResponse(response, addressLevelTypeRepository.getAllNames());
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(getSubjectType(uploadSpec[1]).getUuid(), null, null, FormType.IndividualProfile);
        return addToResponse(response, formMapping);
    }

    private String getProgramEnrolmentSampleFile(String[] uploadSpec, String response) {
        response = addToResponse(response, Arrays.asList(new ProgramEnrolmentHeaders().getAllHeaders()));
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(getSubjectType(uploadSpec[2]).getUuid(), getProgram(uploadSpec[1]).getUuid(), null, FormType.ProgramEnrolment);
        return addToResponse(response, formMapping);
    }

    private String getProgramEncounterSampleFile(String[] uploadSpec, String response) {
        response = addToResponse(response, Arrays.asList(new ProgramEncounterHeaders().getAllHeaders()));
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(getSubjectType(uploadSpec[2]).getUuid(), null, getEncounterType(uploadSpec[1]).getUuid(), FormType.ProgramEncounter);
        return addToResponse(response, formMapping);
    }

    private String getGroupMembersSampleFile(String[] uploadSpec, String response) {
        SubjectType subjectType = getSubjectType(uploadSpec[1]);
        if (subjectType.isHousehold()) {
            response = addToResponse(response, Arrays.asList(new HouseholdMemberHeaders().getAllHeaders()));
        } else {
            GroupMemberHeaders groupMemberHeaders = new GroupMemberHeaders();
            groupMemberHeaders.groupId = uploadSpec[1] + " Id";
            response = addToResponse(response, Arrays.asList(groupMemberHeaders.getAllHeaders()));
        }
        return response;
    }

    private EncounterType getEncounterType(String encounterTypeName) {
        EncounterType encounterType = encounterTypeRepository.findByName(encounterTypeName);
        assertNotNull(encounterType, encounterTypeName);
        return encounterType;
    }

    private Program getProgram(String programName) {
        Program program = programRepository.findByName(programName);
        assertNotNull(program, programName);
        return program;
    }

    private SubjectType getSubjectType(String subjectTypeName) {
        SubjectType subjectType = subjectTypeRepository.findByName(subjectTypeName);
        assertNotNull(subjectType, subjectTypeName);
        return subjectType;
    }

    private void assertNotNull(Object obj, String descriptor) {
        if (obj == null) {
            String errorMessage = String.format("%s not found", descriptor);
            logger.error(errorMessage);
            throw new UnsupportedOperationException(errorMessage);
        }
    }

    private String addToResponse(String str, FormMapping formMapping) {
        assertNotNull(formMapping, "Form mapping");
        String concatenatedString = addCommaIfNecessary(str);
        List<String> conceptNames = formMapping
                .getForm()
                .getApplicableFormElements()
                .stream()
                .filter(formElement -> !ConceptDataType.isGroupQuestion(formElement.getConcept().getDataType()))
                .map(this::getHeaderName)
                .collect(Collectors.toList());
        concatenatedString = concatenatedString.concat(String.join(",", conceptNames));
        return concatenatedString;
    }

    private String getHeaderName(FormElement formElement) {
        String conceptName = formElement.getConcept().getName();
        if (formElement.getGroup() != null) {
            return "\"" + formElement.getGroup().getConcept().getName() + "|" + conceptName + "\"";
        }
        return "\"" + conceptName + "\"";
    }

    private String addToResponse(String inputString, List headers) {
        String outputString = addCommaIfNecessary(inputString);
        return outputString.concat(String.join(",", headers));
    }

    private String addCommaIfNecessary(String str) {
        if (str.length() > 0) {
            return str.concat(",");
        }
        return str;
    }
}
