package org.openchs.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.application.Form;
import org.openchs.application.FormMapping;
import org.openchs.application.KeyType;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.JsonObject;
import org.openchs.service.OrganisationConfigService;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.AddressLevelTypeContract;
import org.openchs.web.request.CustomRegistrationLocationTypeContract;
import org.openchs.web.request.FormMappingContract;
import org.openchs.web.request.application.FormContractWeb;
import org.openchs.web.request.webapp.SubjectTypeSetting;
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
    private AddressLevelTypeRepository addressLevelTypeRepository;
    private OrganisationConfigService organisationConfigService;
    private ObjectMapper objectMapper;

    @Autowired
    public OperationalModulesController(EncounterTypeRepository encounterTypeRepository,
                                        SubjectTypeRepository subjectTypeRepository,
                                        ProgramRepository programRepository,
                                        FormMappingRepository formMappingRepository,
                                        FormRepository formRepository,
                                        AddressLevelTypeRepository addressLevelTypeRepository,
                                        OrganisationConfigService organisationConfigService) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.formMappingRepository = formMappingRepository;
        this.formRepository = formRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.organisationConfigService = organisationConfigService;
        objectMapper = ObjectMapperSingleton.getObjectMapper();
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
        List<AddressLevelTypeContract> addressLevelTypeContracts = addressLevelTypeRepository.getAllLowestAddressLevelTypes()
                .stream()
                .map(AddressLevelTypeContract::fromAddressLevelType)
                .collect(Collectors.toList());
        List<SubjectTypeSetting> customRegistrationLocationTypes = objectMapper.convertValue(organisationConfigService.getSettingsByKey(KeyType.customRegistrationLocations.toString()), new TypeReference<List<SubjectTypeSetting>>() {});
        List<CustomRegistrationLocationTypeContract> customRegistrationLocationTypeContracts = customRegistrationLocationTypes
                .stream()
                .map(this::getCustomRegistrationLocationTypeContract)
                .collect(Collectors.toList());
        return new JsonObject()
                .with("subjectTypes", subjectTypeRepository.findAllOperational())
                .with("programs", programRepository.findAllOperational())
                .with("encounterTypes", encounterTypeRepository.findAllOperational())
                .with("formMappings", formMappingContracts)
                .with("forms", formsWeb)
                .with("addressLevelTypes", addressLevelTypeContracts)
                .with("customRegistrationLocations", customRegistrationLocationTypeContracts);
    }

    private CustomRegistrationLocationTypeContract getCustomRegistrationLocationTypeContract(SubjectTypeSetting lt) {
        CustomRegistrationLocationTypeContract customRegistrationLocationTypeContract = new CustomRegistrationLocationTypeContract();
        customRegistrationLocationTypeContract.setSubjectTypeUUID(lt.getSubjectTypeUUID());
        List<AddressLevelTypeContract> addressLevelTypeContractList = lt.getLocationTypeUUIDs().stream()
                .map(uuid -> AddressLevelTypeContract.fromAddressLevelType(addressLevelTypeRepository.findByUuid(uuid)))
                .collect(Collectors.toList());
        customRegistrationLocationTypeContract.setAddressLevels(addressLevelTypeContractList);
        return customRegistrationLocationTypeContract;
    }
}
