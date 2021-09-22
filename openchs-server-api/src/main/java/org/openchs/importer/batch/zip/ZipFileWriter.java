package org.openchs.importer.batch.zip;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.builder.BuilderException;
import org.openchs.builder.FormBuilderException;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.SubjectType;
import org.openchs.framework.security.AuthService;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.importer.batch.model.BundleFile;
import org.openchs.service.*;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.*;
import org.openchs.web.request.application.ChecklistDetailRequest;
import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.webapp.IdentifierSourceContractWeb;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.lang.String.format;

@Component
@JobScope
public class ZipFileWriter implements ItemWriter<BundleFile> {

    private final AuthService authService;
    private final EncounterTypeService encounterTypeService;
    private final FormMappingService formMappingService;
    private final OrganisationConfigService organisationConfigService;
    private Logger logger;
    private ObjectMapper objectMapper;
    private ConceptService conceptService;
    private FormService formService;
    private LocationService locationService;
    private CatchmentService catchmentService;
    private SubjectTypeService subjectTypeService;
    private ProgramService programService;
    private IndividualRelationService individualRelationService;
    private IndividualRelationshipTypeService individualRelationshipTypeService;
    private ChecklistDetailService checklistDetailService;
    private IdentifierSourceService identifierSourceService;
    private GroupsService groupsService;
    private GroupRoleService groupRoleService;
    private SubjectTypeRepository subjectTypeRepository;
    private GroupPrivilegeService groupPrivilegeService;
    private VideoService videoService;
    private CardService cardService;
    private DashboardService dashboardService;
    private S3Service s3Service;
    private static final String SUBJECT_ICON_DIRECTORY = "subjectTypeIcons";

    @Value("#{jobParameters['userId']}")
    private Long userId;
    @Value("#{jobParameters['organisationUUID']}")
    private String organisationUUID;

    private List<String> fileSequence = new ArrayList<String>() {{
        add("organisationConfig.json");
        add("addressLevelTypes.json");
        add("locations.json");
        add("catchments.json");
        add("subjectTypes.json");
        add("operationalSubjectTypes.json");
        add("programs.json");
        add("operationalPrograms.json");
        add("encounterTypes.json");
        add("operationalEncounterTypes.json");
        add("concepts.json");
        add("forms");
        add("formMappings.json");
        add("individualRelation.json");
        add("relationshipType.json");
        add("identifierSource.json");
        add("checklist.json");
        add("groups.json");
        add("groupRole.json");
        add("groupPrivilege.json");
        add("video.json");
        add("reportCard.json");
        add("reportDashboard.json");
    }};


    @Autowired
    public ZipFileWriter(AuthService authService,
                         ConceptService conceptService,
                         FormService formService,
                         LocationService locationService,
                         CatchmentService catchmentService,
                         SubjectTypeService subjectTypeService,
                         ProgramService programService,
                         EncounterTypeService encounterTypeService,
                         FormMappingService formMappingService,
                         OrganisationConfigService organisationConfigService,
                         IndividualRelationService individualRelationService,
                         IndividualRelationshipTypeService individualRelationshipTypeService,
                         ChecklistDetailService checklistDetailService,
                         IdentifierSourceService identifierSourceService,
                         GroupsService groupsService,
                         GroupRoleService groupRoleService,
                         SubjectTypeRepository subjectTypeRepository,
                         GroupPrivilegeService groupPrivilegeService,
                         VideoService videoService,
                         CardService cardService,
                         DashboardService dashboardService, S3Service s3Service) {
        this.authService = authService;
        this.conceptService = conceptService;
        this.formService = formService;
        this.locationService = locationService;
        this.catchmentService = catchmentService;
        this.subjectTypeService = subjectTypeService;
        this.programService = programService;
        this.encounterTypeService = encounterTypeService;
        this.formMappingService = formMappingService;
        this.organisationConfigService = organisationConfigService;
        this.individualRelationService = individualRelationService;
        this.individualRelationshipTypeService = individualRelationshipTypeService;
        this.checklistDetailService = checklistDetailService;
        this.identifierSourceService = identifierSourceService;
        this.groupsService = groupsService;
        this.groupRoleService = groupRoleService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.groupPrivilegeService = groupPrivilegeService;
        this.videoService = videoService;
        this.cardService = cardService;
        this.dashboardService = dashboardService;
        this.s3Service = s3Service;
        objectMapper = ObjectMapperSingleton.getObjectMapper();
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @PostConstruct
    public void authenticateUser() {
        authService.authenticateByUserId(userId, organisationUUID);
    }

    @Override
    public void write(List<? extends BundleFile> bundleFiles) throws Exception {
        Map<String, byte[]> fileDataMap = bundleFiles.stream().collect(Collectors.toMap(BundleFile::getName, BundleFile::getContent));
        List<String> forms = bundleFiles.stream().filter(jf -> jf.getName().startsWith("forms"))
                .map(jf -> new String(jf.getContent(), StandardCharsets.UTF_8)).collect(Collectors.toList());
        for (String filename : fileSequence) {
            if (filename.equals("forms")) {
                for (String form : forms) deployFile("form", form, bundleFiles);
            } else {
                byte[] fileData = fileDataMap.get(filename);
                if (fileData != null) {
                    deployFile(filename, new String(fileData, StandardCharsets.UTF_8), bundleFiles);
                }
            }
        }
    }

    private String uploadIcon(BundleFile bundleFile) throws IOException {
        String completePath = bundleFile.getName();
        logger.info("uploading icon {}", completePath);
        String[] fileName = completePath.replace(format("%s/", SUBJECT_ICON_DIRECTORY),"").split("\\.");
        String subjectTypeUUID = fileName[0];
        String extension = fileName[1];
        return this.s3Service.uploadByteArray(subjectTypeUUID, extension, "icons", bundleFile.getContent());
    }

    private void deployFile(String fileName, String fileData, List<? extends BundleFile> bundleFiles) throws IOException, FormBuilderException, BuilderException {
        logger.info("processing file {}", fileName);
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        switch (fileName) {
            case "organisationConfig.json":
                OrganisationConfigRequest organisationConfigRequest = convertString(fileData, OrganisationConfigRequest.class);
                organisationConfigService.saveOrganisationConfig(organisationConfigRequest, organisation);
                break;
            case "addressLevelTypes.json":
                AddressLevelTypeContract[] addressLevelTypeContracts = convertString(fileData, AddressLevelTypeContract[].class);
                for (AddressLevelTypeContract addressLevelTypeContract : addressLevelTypeContracts) {
                    locationService.createAddressLevelType(addressLevelTypeContract);
                }
                break;
            case "locations.json":
                LocationContract[] locationContracts = convertString(fileData, LocationContract[].class);
                locationService.saveAll(Arrays.asList(locationContracts));
                break;
            case "catchments.json":
                CatchmentsContract catchmentsContract = convertString(fileData, CatchmentsContract.class);
                catchmentService.saveAllCatchments(catchmentsContract, organisation);
                break;
            case "subjectTypes.json":
                SubjectTypeContract[] subjectTypeContracts = convertString(fileData, SubjectTypeContract[].class);
                for (SubjectTypeContract subjectTypeContract : subjectTypeContracts) {
                    String iconFileName = format("%s/%s", SUBJECT_ICON_DIRECTORY, subjectTypeContract.getUuid());
                    BundleFile iconFile = bundleFiles.stream().filter(f -> f.getName().contains(iconFileName)).findFirst().orElse(null);
                    if (iconFile != null) {
                        String s3ObjectKey = uploadIcon(iconFile);
                        subjectTypeContract.setIconFileS3Key(s3ObjectKey);
                    }
                    subjectTypeService.saveSubjectType(subjectTypeContract);
                }
                break;
            case "operationalSubjectTypes.json":
                OperationalSubjectTypesContract operationalSubjectTypesContract = convertString(fileData, OperationalSubjectTypesContract.class);
                for (OperationalSubjectTypeContract ostc : operationalSubjectTypesContract.getOperationalSubjectTypes()) {
                    subjectTypeService.createOperationalSubjectType(ostc, organisation);
                }
                break;
            case "programs.json":
                ProgramRequest[] programRequests = convertString(fileData, ProgramRequest[].class);
                for (ProgramRequest programRequest : programRequests) {
                    programService.saveProgram(programRequest);
                }
                break;
            case "operationalPrograms.json":
                OperationalProgramsContract operationalProgramsContract = convertString(fileData, OperationalProgramsContract.class);
                for (OperationalProgramContract opc : operationalProgramsContract.getOperationalPrograms()) {
                    programService.createOperationalProgram(opc, organisation);
                }
                break;
            case "encounterTypes.json":
                EncounterTypeContract[] encounterTypeContracts = convertString(fileData, EncounterTypeContract[].class);
                for (EncounterTypeContract encounterTypeContract : encounterTypeContracts) {
                    encounterTypeService.createEncounterType(encounterTypeContract);
                }
                break;
            case "operationalEncounterTypes.json":
                OperationalEncounterTypesContract operationalEncounterTypesContract = convertString(fileData, OperationalEncounterTypesContract.class);
                for (OperationalEncounterTypeContract oetc : operationalEncounterTypesContract.getOperationalEncounterTypes()) {
                    encounterTypeService.createOperationalEncounterType(oetc, organisation);
                }
                break;
            case "concepts.json":
                ConceptContract[] conceptContracts = convertString(fileData, ConceptContract[].class);
                conceptService.saveOrUpdateConcepts(Arrays.asList(conceptContracts));
                break;
            case "form":
                FormContract formContract = convertString(fileData, FormContract.class);
                formContract.validate();
                formService.saveForm(formContract);
                break;
            case "formMappings.json":
                FormMappingContract[] formMappingContracts = convertString(fileData, FormMappingContract[].class);
                for (FormMappingContract formMappingContract : formMappingContracts) {
                    formMappingService.createOrUpdateFormMapping(formMappingContract);
                }
                break;
            case "individualRelation.json":
                IndividualRelationContract[] individualRelationContracts = convertString(fileData, IndividualRelationContract[].class);
                for (IndividualRelationContract individualRelationContract : individualRelationContracts) {
                    individualRelationService.uploadRelation(individualRelationContract);
                }
                break;
            case "relationshipType.json":
                IndividualRelationshipTypeContract[] individualRelationshipTypeContracts = convertString(fileData, IndividualRelationshipTypeContract[].class);
                for (IndividualRelationshipTypeContract individualRelationshipTypeContract : individualRelationshipTypeContracts) {
                    individualRelationshipTypeService.saveRelationshipType(individualRelationshipTypeContract);
                }
                break;
            case "identifierSource.json":
                IdentifierSourceContractWeb[] identifierSourceContractWebs = convertString(fileData, IdentifierSourceContractWeb[].class);
                for (IdentifierSourceContractWeb identifierSourceContractWeb : identifierSourceContractWebs) {
                    identifierSourceService.saveIdSource(identifierSourceContractWeb);
                }
                break;
            case "checklist.json":
                ChecklistDetailRequest[] checklistDetailRequests = convertString(fileData, ChecklistDetailRequest[].class);
                for (ChecklistDetailRequest checklistDetailRequest : checklistDetailRequests) {
                    checklistDetailService.saveChecklist(checklistDetailRequest);
                }
                break;
            case "groups.json":
                GroupContract[] groupContracts = convertString(fileData, GroupContract[].class);
                for (GroupContract groupContract : groupContracts) {
                    groupsService.saveGroup(groupContract);
                }
                break;
            case "groupRole.json":
                GroupRoleContract[] groupRoleContracts = convertString(fileData, GroupRoleContract[].class);
                for (GroupRoleContract groupRoleContract : groupRoleContracts) {
                    SubjectType groupSubjectType = subjectTypeRepository.findByUuid(groupRoleContract.getGroupSubjectTypeUUID());
                    SubjectType memberSubjectType = subjectTypeRepository.findByUuid(groupRoleContract.getMemberSubjectTypeUUID());
                    groupRoleService.saveGroupRole(groupRoleContract, groupSubjectType, memberSubjectType);
                }
                break;
            case "groupPrivilege.json":
                GroupPrivilegeContractWeb[] groupPrivilegeContracts = convertString(fileData, GroupPrivilegeContractWeb[].class);
                for (GroupPrivilegeContractWeb groupPrivilegeContract : groupPrivilegeContracts) {
                    groupPrivilegeService.uploadPrivileges(groupPrivilegeContract);
                }
                break;
            case "video.json":
                VideoContract[] videoContracts = convertString(fileData, VideoContract[].class);
                for (VideoContract videoContract : videoContracts) {
                    videoService.saveVideo(videoContract);
                }
                break;
            case "reportCard.json":
                CardContract[] cardContracts = convertString(fileData, CardContract[].class);
                for (CardContract cardContract : cardContracts) {
                    cardService.uploadCard(cardContract);
                }
                break;
            case "reportDashboard.json":
                DashboardContract[] dashboardContracts = convertString(fileData, DashboardContract[].class);
                for (DashboardContract dashboardContract : dashboardContracts) {
                    dashboardService.uploadDashboard(dashboardContract);
                }
                break;
        }
    }

    private <T> T convertString(String data, Class<T> convertTo) throws IOException {
        return objectMapper.readValue(data, convertTo);
    }
}
