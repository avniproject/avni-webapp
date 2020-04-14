package org.openchs.web;

import org.openchs.application.FormMapping;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.JsonObject;
import org.openchs.dao.application.FormRepository;
import org.openchs.web.request.FormMappingContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class OperationalModulesController {

    private EncounterTypeRepository encounterTypeRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private ProgramRepository programRepository;
    private FormMappingRepository formMappingRepository;
    private FormRepository formRepository;

    @Autowired
    public OperationalModulesController(EncounterTypeRepository encounterTypeRepository, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, FormMappingRepository formMappingRepository, FormRepository formRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.formMappingRepository = formMappingRepository;
        this.formRepository = formRepository;
    }

    @GetMapping("/web/operationalModules")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin', 'admin')")
    @ResponseBody
    public JsonObject getModules() {
        List<FormMapping> allOperational = formMappingRepository.findAllOperational();
        List<FormMappingContract> formMappingContracts = allOperational
                .stream()
                .map(FormMappingContract::fromFormMapping)
                .collect(Collectors.toList());
        return new JsonObject()
                .with("subjectTypes", subjectTypeRepository.findAllOperational())
                .with("programs", programRepository.findAllOperational())
                .with("encounterTypes", encounterTypeRepository.findAllOperational())
                .with("formMappings", formMappingContracts)
                .with("forms", formRepository.findAllByIsVoidedFalse());
    }
}
