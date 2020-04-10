package org.openchs.web;

import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.application.FormMapping;
import org.openchs.application.Form;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.Gender;
import org.openchs.domain.JsonObject;
import org.openchs.web.request.AddressLevelTypeContract;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.FormMappingContract;
import org.openchs.web.request.application.FormContractWeb;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import sun.misc.FormattedFloatingDecimal;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class OperationalModulesController {

    private EncounterTypeRepository encounterTypeRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private ProgramRepository programRepository;
    private FormMappingRepository formMappingRepository;
    private FormRepository formRepository;
    private AddressLevelTypeRepository addressLevelTypeRepository;
    
    @Autowired
    public OperationalModulesController(EncounterTypeRepository encounterTypeRepository, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, FormMappingRepository formMappingRepository, FormRepository formRepository,AddressLevelTypeRepository addressLevelTypeRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.formMappingRepository = formMappingRepository;
        this.formRepository = formRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
    }

    @GetMapping("/web/operationalModules")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin', 'admin')")
    @ResponseBody
    public JsonObject getModules() {
        List<Form> forms = formRepository.findAllByIsVoidedFalse();
        List<FormContractWeb> formsWeb = forms.stream().map(FormContractWeb::fromForm).collect(Collectors.toList());
        List<FormMapping> allOperational = formMappingRepository.findAllOperational();
        List<FormMappingContract> formMappingContracts = allOperational
                .stream()
                .map(FormMappingContract::fromFormMapping)
                .collect(Collectors.toList());
        List<AddressLevelTypeContract> addressLevelTypeContracts = addressLevelTypeRepository.getAllLowestAddressLevel()
                .stream()
                .map(AddressLevelTypeContract::fromAddressLevelType)
                .collect(Collectors.toList());
        return new JsonObject()
                .with("subjectTypes", subjectTypeRepository.findAllOperational())
                .with("programs", programRepository.findAllOperational())
                .with("encounterTypes", encounterTypeRepository.findAllOperational())
                .with("formMappings", formMappingContracts)
                .with("forms", formsWeb)
                .with("lowestLevelAddresses", addressLevelTypeContracts);
    }
}
