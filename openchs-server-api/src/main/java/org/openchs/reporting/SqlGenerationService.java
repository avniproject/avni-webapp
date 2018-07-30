package org.openchs.reporting;

import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.Program;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
public class SqlGenerationService {
    private String VIEW_TEMPLATE;

    @Autowired
    private OperationalProgramRepository operationalProgramRepository;

    @Autowired
    private FormMappingRepository formMappingRepository;

    public String getSqlFor(String programName) throws IOException, URISyntaxException {
        VIEW_TEMPLATE = new BufferedReader(new InputStreamReader(new ClassPathResource("/pivot/pivot.sql").getInputStream()))
                .lines()
                .collect(Collectors.joining("\n"));
        List<Program> programs = new ArrayList<>();
        operationalProgramRepository.findAll().forEach(op -> programs.add(op.getProgram()));
        return programs.stream().filter(program -> program.getName().equals(programName))
                .map(this::getSqlForProgram)
                .findFirst()
                .orElse("");
    }

    private Form getRegistrationForm() {
        return formMappingRepository
                .findByEntityIdAndObservationsTypeEntityIdAndFormFormType(null, null, FormType.IndividualProfile)
                .getForm();
    }

    private Form getProgramEnrolmentForm(Program program) {
        return formMappingRepository
                .findByEntityIdAndObservationsTypeEntityIdAndFormFormType(program.getId(), null, FormType.ProgramEnrolment)
                .getForm();
    }

    private List<Form> getProgramEncounterForms(Program program) {
        return formMappingRepository
                .findByEntityIdAndOrganisationIdIsNotNull(program.getId())
                .stream()
                .filter(formMapping -> formMapping.getForm().getFormType().equals(FormType.ProgramEncounter))
                .map(FormMapping::getForm)
                .collect(Collectors.toList());
    }

    private Map<String, List<FormElement>> getAllFormConcepts(Program program) {
        Map<String, List<FormElement>> conceptMap = new HashMap<>();
        List<FormElement> registrationFormElements = getRegistrationForm().getAllFormElements();
        List<FormElement> enrolmentFormElements = getProgramEnrolmentForm(program).getAllFormElements();
        List<FormElement> encounterFormElements = getProgramEncounterForms(program).stream()
                .flatMap(f -> f.getAllFormElements().stream())
                .collect(Collectors.toList());
        conceptMap.put("individual", registrationFormElements);
        conceptMap.put("programEnrolment", enrolmentFormElements);
        conceptMap.put("programEncounter", encounterFormElements);
        return conceptMap;
    }

    private String getSqlForProgram(Program program) {
        AtomicReference<String> viewQuery = new AtomicReference<>(VIEW_TEMPLATE);
        getAllFormConcepts(program).forEach((key, value) -> {
            String selectString = value.parallelStream().map(formElement -> {
                StringBuilder stringBuilder = new StringBuilder();
                switch (ConceptDataType.valueOf(formElement.getConcept().getDataType())) {
                    case Numeric:
                    case Text:
                    case Notes:
                    case Date:
                        stringBuilder
                                .append(key)
                                .append(".observations->>'")
                                .append(formElement.getConcept().getUuid())
                                .append("'");
                        break;
                    case Coded: {
                        if (formElement.isSingleSelect()) {
                            stringBuilder.append("single_select_coded(")
                                    .append(key)
                                    .append(".observations->>'")
                                    .append(formElement.getConcept().getUuid())
                                    .append("')");
                        } else {
                            stringBuilder.append("multi_select_coded(")
                                    .append(key)
                                    .append(".observations->'")
                                    .append(formElement.getConcept().getUuid())
                                    .append("')");
                        }
                        break;
                    }
                }
                stringBuilder.append("::TEXT as \"").append(formElement.getConcept().getName()).append("\"");
                return stringBuilder.toString();
            }).collect(Collectors.joining(","));
            viewQuery.set(viewQuery.get().replace("${" + key + "}", selectString));
        });
        viewQuery.set(viewQuery.get().replace("${programName}", program.getName()));
        return viewQuery.get();
    }


}
