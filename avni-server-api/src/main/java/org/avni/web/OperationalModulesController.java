package org.avni.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.application.Form;
import org.avni.application.FormMapping;
import org.avni.application.KeyType;
import org.avni.dao.AddressLevelTypeRepository;
import org.avni.dao.EncounterTypeRepository;
import org.avni.dao.ProgramRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.dao.application.FormRepository;
import org.avni.dao.individualRelationship.IndividualRelationRepository;
import org.avni.domain.JsonObject;
import org.avni.service.OrganisationConfigService;
import org.avni.util.ObjectMapperSingleton;
import org.avni.web.request.AddressLevelTypeContract;
import org.avni.web.request.CustomRegistrationLocationTypeContract;
import org.avni.web.request.FormMappingContract;
import org.avni.web.request.application.FormContractWeb;
import org.avni.web.request.webapp.IndividualRelationContract;
import org.avni.web.request.webapp.SubjectTypeSetting;
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
    private IndividualRelationRepository individualRelationRepository;
    private ObjectMapper objectMapper;

    @Autowired
    public OperationalModulesController(EncounterTypeRepository encounterTypeRepository,
                                        SubjectTypeRepository subjectTypeRepository,
                                        ProgramRepository programRepository,
                                        FormMappingRepository formMappingRepository,
                                        FormRepository formRepository,
                                        AddressLevelTypeRepository addressLevelTypeRepository,
                                        OrganisationConfigService organisationConfigService,
                                        IndividualRelationRepository individualRelationRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.formMappingRepository = formMappingRepository;
        this.formRepository = formRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.organisationConfigService = organisationConfigService;
        this.individualRelationRepository = individualRelationRepository;
        objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    @GetMapping("/web/operationalModules")
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    @ResponseBody
    public JsonObject getModules() {
        List<Form> forms = formRepository.findAllByIsVoidedFalse();
        List<FormContractWeb> formsWeb = forms.stream().map(FormContractWeb::fromForm).collect(Collectors.toList());
        List<FormMapping> allOperational = formMappingRepository.findAllOperational();
        List<FormMappingContract> formMappingContracts = allOperational
                .stream()
                .map(FormMappingContract::fromFormMapping)
                .collect(Collectors.toList());
        List<AddressLevelTypeContract> allLowestAddressLevels = addressLevelTypeRepository.getAllLowestAddressLevelTypes()
                .stream()
                .map(AddressLevelTypeContract::fromAddressLevelType)
                .collect(Collectors.toList());
        List<AddressLevelTypeContract> allAddressLevels = addressLevelTypeRepository.findAllByIsVoidedFalse()
                .stream()
                .map(AddressLevelTypeContract::fromAddressLevelType)
                .collect(Collectors.toList());
        List<SubjectTypeSetting> customRegistrationLocationTypes = objectMapper.convertValue(organisationConfigService.getSettingsByKey(KeyType.customRegistrationLocations.toString()), new TypeReference<List<SubjectTypeSetting>>() {});
        List<CustomRegistrationLocationTypeContract> customRegistrationLocationTypeContracts = customRegistrationLocationTypes
                .stream()
                .map(this::getCustomRegistrationLocationTypeContract)
                .collect(Collectors.toList());
        List<IndividualRelationContract> relations = individualRelationRepository.findAll()
                .stream()
                .map(IndividualRelationContract::fromEntity)
                .collect(Collectors.toList());
        return new JsonObject()
                .with("subjectTypes", subjectTypeRepository.findAllOperational())
                .with("programs", programRepository.findAllOperational())
                .with("encounterTypes", encounterTypeRepository.findAllOperational())
                .with("formMappings", formMappingContracts)
                .with("forms", formsWeb)
                .with("addressLevelTypes", allLowestAddressLevels)
                .with("customRegistrationLocations", customRegistrationLocationTypeContracts)
                .with("relations", relations)
                .with("allAddressLevels", allAddressLevels);
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
