package org.openchs.web;

import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OperationalModulesController {

    private EncounterTypeRepository encounterTypeRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private ProgramRepository programRepository;
    private FormMappingRepository formMappingRepository;

    @Autowired
    public OperationalModulesController(EncounterTypeRepository encounterTypeRepository, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, FormMappingRepository formMappingRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.formMappingRepository = formMappingRepository;
    }

    @GetMapping("/web/operationalModules")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin', 'admin')")
    @ResponseBody
    public JsonObject getModules() {
        return new JsonObject()
                .with("subjectTypes", subjectTypeRepository.findAllOperational())
                .with("programs", programRepository.findAllOperational())
                .with("encounterTypes", encounterTypeRepository.findAllOperational())
                .with("formMappings", formMappingRepository.findAllOperational());
    }
}
