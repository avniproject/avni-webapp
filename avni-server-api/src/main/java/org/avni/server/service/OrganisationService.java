package org.avni.server.service;

import com.amazonaws.services.s3.AmazonS3URI;
import com.fasterxml.jackson.core.PrettyPrinter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import org.apache.commons.io.IOUtils;
import org.avni.server.application.Form;
import org.avni.server.application.FormMapping;
import org.avni.server.dao.*;
import org.avni.server.dao.application.FormElementGroupRepository;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.dao.application.FormRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationshipRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.avni.server.domain.*;
import org.avni.server.service.application.MenuItemService;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.util.S;
import org.avni.server.web.request.*;
import org.avni.server.web.request.application.ChecklistDetailRequest;
import org.avni.server.web.request.application.FormContract;
import org.avni.server.web.request.application.menu.MenuItemContract;
import org.avni.server.web.request.webapp.CatchmentExport;
import org.avni.server.web.request.webapp.CatchmentsExport;
import org.avni.server.web.request.webapp.ConceptExport;
import org.avni.server.web.request.webapp.IdentifierSourceContractWeb;
import org.avni.server.web.request.webapp.documentation.DocumentationContract;
import org.avni.server.web.request.webapp.task.TaskStatusContract;
import org.avni.server.web.request.webapp.task.TaskTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class OrganisationService {

    private final FormRepository formRepository;
    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final LocationRepository locationRepository;
    private final CatchmentRepository catchmentRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final ProgramRepository programRepository;
    private final OperationalProgramRepository operationalProgramRepository;
    private final FormMappingRepository formMappingRepository;
    private final OrganisationConfigRepository organisationConfigRepository;
    private final IdentifierSourceRepository identifierSourceRepository;
    private final ConceptRepository conceptRepository;
    private final IndividualRelationService individualRelationService;
    private final IndividualRelationshipTypeService individualRelationshipTypeService;
    private final ChecklistDetailService checklistDetailService;
    private final GroupRepository groupRepository;
    private final GroupRoleRepository groupRoleRepository;
    private final GroupPrivilegeRepository groupPrivilegeRepository;
    private final UserGroupRepository userGroupRepository;
    private final ChecklistItemDetailRepository checklistItemDetailRepository;
    private final ChecklistDetailRepository checklistDetailRepository;
    private final IdentifierUserAssignmentRepository identifierUserAssignmentRepository;
    private final IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository;
    private final IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private final IndividualRelationRepository individualRelationRepository;
    private final FormElementRepository formElementRepository;
    private final FormElementGroupRepository formElementGroupRepository;
    private final ConceptAnswerRepository conceptAnswerRepository;
    private final TranslationRepository translationRepository;
    private final VideoRepository videoRepository;
    private final VideoService videoService;
    private final CardService cardService;
    private final DashboardService dashboardService;
    private final MenuItemService menuItemService;
    private final CardRepository cardRepository;
    private final DashboardRepository dashboardRepository;
    private final DashboardSectionCardMappingRepository dashboardSectionCardMappingRepository;
    private final DashboardSectionRepository dashboardSectionRepository;
    private final GroupDashboardRepository groupDashboardRepository;
    private final Msg91ConfigRepository msg91ConfigRepository;
    private final S3Service s3Service;

    //Tx repositories
    private final RuleFailureTelemetryRepository ruleFailureTelemetryRepository;
    private final IdentifierAssignmentRepository identifierAssignmentRepository;
    private final SyncTelemetryRepository syncTelemetryRepository;
    private final VideoTelemetricRepository videoTelemetricRepository;
    private final GroupSubjectRepository groupSubjectRepository;
    private final IndividualRelationshipRepository individualRelationshipRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ChecklistRepository checklistRepository;
    private final ProgramEncounterRepository programEncounterRepository;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final EncounterRepository encounterRepository;
    private final IndividualRepository individualRepository;
    private final EntityApprovalStatusRepository entityApprovalStatusRepository;
    private final CommentRepository commentRepository;
    private final CommentThreadRepository commentThreadRepository;
    private final NewsRepository newsRepository;
    private final SubjectMigrationRepository subjectMigrationRepository;
    private final DocumentationService documentationService;
    private final TaskTypeService taskTypeService;
    private final TaskStatusService taskStatusService;
    private final Logger logger;

    @Autowired
    public OrganisationService(FormRepository formRepository,
                               AddressLevelTypeRepository addressLevelTypeRepository,
                               LocationRepository locationRepository,
                               CatchmentRepository catchmentRepository,
                               SubjectTypeRepository subjectTypeRepository,
                               OperationalSubjectTypeRepository operationalSubjectTypeRepository,
                               OperationalEncounterTypeRepository operationalEncounterTypeRepository,
                               EncounterTypeRepository encounterTypeRepository,
                               ProgramRepository programRepository,
                               OperationalProgramRepository operationalProgramRepository,
                               FormMappingRepository formMappingRepository,
                               OrganisationConfigRepository organisationConfigRepository,
                               IdentifierSourceRepository identifierSourceRepository,
                               ConceptRepository conceptRepository,
                               IndividualRelationService individualRelationService,
                               IndividualRelationshipTypeService individualRelationshipTypeService,
                               ChecklistDetailService checklistDetailService,
                               GroupRepository groupRepository,
                               GroupRoleRepository groupRoleRepository,
                               GroupPrivilegeRepository groupPrivilegeRepository,
                               UserGroupRepository userGroupRepository,
                               ChecklistItemDetailRepository checklistItemDetailRepository,
                               ChecklistDetailRepository checklistDetailRepository,
                               IdentifierUserAssignmentRepository identifierUserAssignmentRepository,
                               IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository,
                               IndividualRelationshipTypeRepository individualRelationshipTypeRepository,
                               IndividualRelationRepository individualRelationRepository,
                               FormElementRepository formElementRepository,
                               FormElementGroupRepository formElementGroupRepository,
                               ConceptAnswerRepository conceptAnswerRepository,
                               TranslationRepository translationRepository,
                               VideoRepository videoRepository,
                               VideoService videoService,
                               CardService cardService,
                               DashboardService dashboardService,
                               MenuItemService menuItemService, CardRepository cardRepository,
                               DashboardRepository dashboardRepository,
                               DashboardSectionCardMappingRepository dashboardSectionCardMappingRepository,
                               DashboardSectionRepository dashboardSectionRepository,
                               GroupDashboardRepository groupDashboardRepository,
                               Msg91ConfigRepository msg91ConfigRepository,
                               S3Service s3Service, RuleFailureTelemetryRepository ruleFailureTelemetryRepository,
                               IdentifierAssignmentRepository identifierAssignmentRepository,
                               SyncTelemetryRepository syncTelemetryRepository,
                               VideoTelemetricRepository videoTelemetricRepository,
                               GroupSubjectRepository groupSubjectRepository,
                               IndividualRelationshipRepository individualRelationshipRepository,
                               ChecklistItemRepository checklistItemRepository,
                               ChecklistRepository checklistRepository,
                               ProgramEncounterRepository programEncounterRepository,
                               ProgramEnrolmentRepository programEnrolmentRepository,
                               EncounterRepository encounterRepository,
                               IndividualRepository individualRepository,
                               EntityApprovalStatusRepository entityApprovalStatusRepository,
                               CommentRepository commentRepository,
                               CommentThreadRepository commentThreadRepository,
                               NewsRepository newsRepository,
                               SubjectMigrationRepository subjectMigrationRepository,
                               DocumentationService documentationService,
                               TaskTypeService taskTypeService,
                               TaskStatusService taskStatusService) {
        this.formRepository = formRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.locationRepository = locationRepository;
        this.catchmentRepository = catchmentRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programRepository = programRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        this.formMappingRepository = formMappingRepository;
        this.organisationConfigRepository = organisationConfigRepository;
        this.identifierSourceRepository = identifierSourceRepository;
        this.conceptRepository = conceptRepository;
        this.individualRelationService = individualRelationService;
        this.individualRelationshipTypeService = individualRelationshipTypeService;
        this.checklistDetailService = checklistDetailService;
        this.groupRepository = groupRepository;
        this.groupRoleRepository = groupRoleRepository;
        this.groupPrivilegeRepository = groupPrivilegeRepository;
        this.userGroupRepository = userGroupRepository;
        this.checklistItemDetailRepository = checklistItemDetailRepository;
        this.checklistDetailRepository = checklistDetailRepository;
        this.identifierUserAssignmentRepository = identifierUserAssignmentRepository;
        this.individualRelationGenderMappingRepository = individualRelationGenderMappingRepository;
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.individualRelationRepository = individualRelationRepository;
        this.formElementRepository = formElementRepository;
        this.formElementGroupRepository = formElementGroupRepository;
        this.conceptAnswerRepository = conceptAnswerRepository;
        this.translationRepository = translationRepository;
        this.videoRepository = videoRepository;
        this.videoService = videoService;
        this.cardService = cardService;
        this.dashboardService = dashboardService;
        this.menuItemService = menuItemService;
        this.cardRepository = cardRepository;
        this.dashboardRepository = dashboardRepository;
        this.dashboardSectionCardMappingRepository = dashboardSectionCardMappingRepository;
        this.dashboardSectionRepository = dashboardSectionRepository;
        this.groupDashboardRepository = groupDashboardRepository;
        this.msg91ConfigRepository = msg91ConfigRepository;
        this.s3Service = s3Service;
        this.ruleFailureTelemetryRepository = ruleFailureTelemetryRepository;
        this.identifierAssignmentRepository = identifierAssignmentRepository;
        this.syncTelemetryRepository = syncTelemetryRepository;
        this.videoTelemetricRepository = videoTelemetricRepository;
        this.groupSubjectRepository = groupSubjectRepository;
        this.individualRelationshipRepository = individualRelationshipRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.checklistRepository = checklistRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.encounterRepository = encounterRepository;
        this.individualRepository = individualRepository;
        this.entityApprovalStatusRepository = entityApprovalStatusRepository;
        this.commentRepository = commentRepository;
        this.commentThreadRepository = commentThreadRepository;
        this.newsRepository = newsRepository;
        this.subjectMigrationRepository = subjectMigrationRepository;
        this.documentationService = documentationService;
        this.taskTypeService = taskTypeService;
        this.taskStatusService = taskStatusService;
        logger = LoggerFactory.getLogger(this.getClass());
    }


    public void addOrganisationConfigJson(Long orgId, ZipOutputStream zos) throws IOException {
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(orgId);
        if (organisationConfig != null) {
            addFileToZip(zos, "organisationConfig.json", OrganisationConfigRequest.fromOrganisationConfig(organisationConfig));
        }
    }

    public void addVideoJson(ZipOutputStream zos) throws IOException {
        List<VideoContract> videoContracts = videoService.getAllVideos();
        if (!videoContracts.isEmpty()) {
            addFileToZip(zos, "video.json", videoContracts);
        }
    }

    public void addRelationJson(ZipOutputStream zos) throws IOException {
        List<IndividualRelationContract> individualRelationContractList = individualRelationService.getAll();
        if (!individualRelationContractList.isEmpty()) {
            addFileToZip(zos, "individualRelation.json", individualRelationContractList);
        }
    }

    public void addRelationShipTypeJson(ZipOutputStream zos) throws IOException {
        List<IndividualRelationshipTypeContract> allRelationshipTypes = individualRelationshipTypeService.getAllRelationshipTypes();
        if (!allRelationshipTypes.isEmpty()) {
            addFileToZip(zos, "relationshipType.json", allRelationshipTypes);
        }
    }

    public void addIdentifierSourceJson(ZipOutputStream zos, boolean includeLocations) throws IOException {
        List<IdentifierSource> identifierSources = identifierSourceRepository.findAll();
        List<IdentifierSourceContractWeb> identifierSourceContractWeb = identifierSources.stream().map(IdentifierSourceContractWeb::fromIdentifierSource)
                .peek(id -> {
                    if (id.getCatchmentId() == null) {
                        id.setCatchmentUUID(null);
                    } else {
                        id.setCatchmentUUID(catchmentRepository.findOne(id.getCatchmentId()).getUuid());
                    }
                })
                .filter(idSource -> includeLocations || idSource.getCatchmentId() == null)
                .collect(Collectors.toList());
        if (!identifierSourceContractWeb.isEmpty()) {
            addFileToZip(zos, "identifierSource.json", identifierSourceContractWeb);
        }
    }

    public void addChecklistDetailJson(ZipOutputStream zos) throws IOException {
        List<ChecklistDetailRequest> allChecklistDetail = checklistDetailService.getAllChecklistDetail();
        if (!allChecklistDetail.isEmpty()) {
            addFileToZip(zos, "checklist.json", allChecklistDetail);
        }
    }

    public void addGroupsJson(ZipOutputStream zos) throws IOException {
        List<GroupContract> groups = groupRepository.findAll().stream()
                .filter(group -> !group.getName().equals("Everyone"))
                .map(GroupContract::fromEntity).collect(Collectors.toList());
        if (!groups.isEmpty()) {
            addFileToZip(zos, "groups.json", groups);
        }
    }

    public void addGroupPrivilegeJson(ZipOutputStream zos) throws IOException {
        List<GroupPrivilegeContractWeb> groupPrivileges = groupPrivilegeRepository.findAll().stream()
                .filter(groupPrivilege -> !groupPrivilege.getGroup().getName().equals("Everyone"))
                .map(GroupPrivilegeContractWeb::fromEntity).collect(Collectors.toList());
        if (!groupPrivileges.isEmpty()) {
            addFileToZip(zos, "groupPrivilege.json", groupPrivileges);
        }
    }

    public void addGroupRoleJson(ZipOutputStream zos) throws IOException {
        List<GroupRoleContract> groupRoles = groupRoleRepository.findAll().stream()
                .map(GroupRoleContract::fromEntity).collect(Collectors.toList());
        if (!groupRoles.isEmpty()) {
            addFileToZip(zos, "groupRole.json", groupRoles);
        }
    }

    public void addFormMappingsJson(Long orgId, ZipOutputStream zos) throws IOException {
        List<FormMapping> formMappings = formMappingRepository.findAllByOrganisationId(orgId);
        List<FormMappingContract> contracts = formMappings.stream()
                .map(FormMappingContract::fromFormMapping)
                .collect(Collectors.toList());
        addFileToZip(zos, "formMappings.json", contracts);
    }

    public void addOperationalProgramsJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        List<OperationalProgram> operationalPrograms = operationalProgramRepository
                .findAllByOrganisationId(organisation.getId());
        List<OperationalProgramContract> contracts = operationalPrograms.stream()
                .map(OperationalProgramContract::fromOperationalProgram)
                .collect(Collectors.toList());
        OperationalProgramsContract operationalProgramsContract = new OperationalProgramsContract();
        operationalProgramsContract.setOperationalPrograms(contracts);
        addFileToZip(zos, "operationalPrograms.json", operationalProgramsContract);
    }

    public void addProgramsJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        List<Program> programs = programRepository.findAllByOrganisationId(organisation.getId());
        List<ProgramRequest> contracts = programs.stream().map(ProgramRequest::fromProgram)
                .collect(Collectors.toList());
        addFileToZip(zos, "programs.json", contracts);
    }

    public void addOperationalEncounterTypesJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        List<OperationalEncounterType> operationalEncounterTypes = operationalEncounterTypeRepository
                .findAllByOrganisationId(organisation.getId());
        List<OperationalEncounterTypeContract> contracts = operationalEncounterTypes.stream()
                .map(OperationalEncounterTypeContract::fromOperationalEncounterType)
                .collect(Collectors.toList());
        OperationalEncounterTypesContract operationalEncounterTypesContract = new OperationalEncounterTypesContract();
        operationalEncounterTypesContract.setOperationalEncounterTypes(contracts);
        addFileToZip(zos, "operationalEncounterTypes.json", operationalEncounterTypesContract);
    }

    public void addEncounterTypesJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        List<EncounterType> encounterTypes = encounterTypeRepository.findAllByOrganisationId(organisation.getId());
        List<EntityTypeContract> contracts = encounterTypes.stream().map(EntityTypeContract::fromEncounterType)
                .collect(Collectors.toList());
        addFileToZip(zos, "encounterTypes.json", contracts);
    }

    public void addOperationalSubjectTypesJson(Organisation org, ZipOutputStream zos) throws IOException {
        List<OperationalSubjectType> operationalSubjectTypes = operationalSubjectTypeRepository
                .findAllByOrganisationId(org.getId());
        List<OperationalSubjectTypeContract> operationalSubjectTypeContracts = operationalSubjectTypes.stream()
                .map(OperationalSubjectTypeContract::fromOperationalSubjectType)
                .collect(Collectors.toList());
        OperationalSubjectTypesContract operationalSubjectTypesContract = new OperationalSubjectTypesContract();
        operationalSubjectTypesContract.setOperationalSubjectTypes(operationalSubjectTypeContracts);
        addFileToZip(zos, "operationalSubjectTypes.json", operationalSubjectTypesContract);

    }

    public void addSubjectTypesJson(Long orgId, ZipOutputStream zos) throws IOException {
        Stream<SubjectType> subjectTypes = subjectTypeRepository.findAllByOrganisationId(orgId).stream();
        List<SubjectTypeContract> subjectTypeContracts = subjectTypes.map(SubjectTypeContract::fromSubjectType)
                .collect(Collectors.toList());
        addFileToZip(zos, "subjectTypes.json", subjectTypeContracts);
    }

    public void addCatchmentsJson(Organisation organisation, ZipOutputStream zos) throws IOException {
        Stream<Catchment> allCatchments = catchmentRepository.findAllByOrganisationId(organisation.getId()).stream();
        List<CatchmentExport> catchmentExports = allCatchments.map(CatchmentExport::fromCatchment).collect(Collectors.toList());
        CatchmentsExport catchmentsExport = new CatchmentsExport();
        catchmentsExport.setCatchments(catchmentExports);
        addFileToZip(zos, "catchments.json", catchmentsExport);
    }

    public void addAddressLevelsJson(Long orgId, ZipOutputStream zos) throws IOException {
        List<LocationContract> contracts = new ArrayList<>();
        List<AddressLevel> allAddressLevels = locationRepository.findAllByOrganisationId(orgId);
        List<AddressLevel> rootNodes = allAddressLevels.stream()
                .filter(addressLevel -> addressLevel.getParent() == null)
                .collect(Collectors.toList());
        for (AddressLevel node : rootNodes) {
            addAddressLevel(node, allAddressLevels, contracts);
        }
        addFileToZip(zos, "locations.json", contracts);
    }

    private void addAddressLevel(AddressLevel theNode, List<AddressLevel> allAddressLevels, List<LocationContract> contracts) {
        List<AddressLevel> childNodes = allAddressLevels.stream()
                .filter(addressLevelType -> {
                    AddressLevel parent = addressLevelType.getParent();
                    return parent != null && parent.getId().equals(theNode.getId());
                })
                .collect(Collectors.toList());
        contracts.add(LocationContract.fromAddressLevel(theNode));
        for (AddressLevel child : childNodes) {
            addAddressLevel(child, allAddressLevels, contracts);
        }
    }

    public void addAddressLevelTypesJson(Long orgId, ZipOutputStream zos) throws IOException {

        List<AddressLevelTypeContract> contracts = new ArrayList<>();
        List<AddressLevelType> allAddressLevelTypes = addressLevelTypeRepository.findAllByOrganisationId(orgId);
        List<AddressLevelType> rootNodes = allAddressLevelTypes.stream()
                .filter(addressLevelType -> addressLevelType.getParent() == null)
                .collect(Collectors.toList());
        for (AddressLevelType node : rootNodes) {
            addAddressLevelType(node, allAddressLevelTypes, contracts);
        }
        addFileToZip(zos, "addressLevelTypes.json", contracts);
    }

    private void addAddressLevelType(AddressLevelType theNode, List<AddressLevelType> allAddressLevelTypes, List<AddressLevelTypeContract> contracts) {
        List<AddressLevelType> childNodes = allAddressLevelTypes.stream()
                .filter(addressLevelType -> {
                    AddressLevelType parent = addressLevelType.getParent();
                    return parent != null && parent.getId().equals(theNode.getId());
                })
                .collect(Collectors.toList());
        contracts.add(AddressLevelTypeContract.fromAddressLevelType(theNode));
        for (AddressLevelType child : childNodes) {
            addAddressLevelType(child, allAddressLevelTypes, contracts);
        }
    }

    public void addConceptsJson(Long orgId, ZipOutputStream zos) throws IOException {
        List<Concept> allConcepts = conceptRepository.findAllByOrganisationId(orgId);
        List<ConceptExport> conceptContracts = allConcepts.stream()
                .sorted(Comparator.comparing(Concept::getName, String::compareToIgnoreCase))
                .map(ConceptExport::fromConcept)
                .collect(Collectors.toList());
        addFileToZip(zos, "concepts.json", conceptContracts);
    }

    public void addFormsJson(Long orgId, ZipOutputStream zos) throws IOException {
        List<Form> forms = formRepository.findAllByOrganisationId(orgId);
        if (forms.size() > 1) {
            addDirectoryToZip(zos, "forms");
        }
        for (Form form : forms) {
            FormContract formContract = FormContract.fromForm(form);
            addFileToZip(zos, String.format("forms/%s.json", form.getName().replaceAll("/", "_")), formContract);
        }
    }

    public void addIcons(ZipOutputStream zos) throws IOException {
        List<SubjectType> subjectTypes = subjectTypeRepository.findAllByIconFileS3KeyNotNull();
        if (subjectTypes.size() > 0) {
            addDirectoryToZip(zos, "subjectTypeIcons");
        }
        for (SubjectType subjectType : subjectTypes) {
            AmazonS3URI amazonS3URI = new AmazonS3URI(subjectType.getIconFileS3Key());
            String objectKey = amazonS3URI.getKey();
            InputStream objectContent = s3Service.getObjectContent(objectKey);
            String extension = S.getLastStringAfter(objectKey, ".");
            addIconToZip(zos, String.format("subjectTypeIcons/%s.%s", subjectType.getUuid(), extension), IOUtils.toByteArray(objectContent));
        }
    }

    public void addReportCards(ZipOutputStream zos) throws IOException {
        List<CardContract> cardContracts = cardService.getAll();
        if (!cardContracts.isEmpty()) {
            addFileToZip(zos, "reportCard.json", cardContracts);
        }
    }

    public void addReportDashboard(ZipOutputStream zos) throws IOException {
        List<DashboardContract> dashboardContracts = dashboardService.getAll();
        if (!dashboardContracts.isEmpty()) {
            addFileToZip(zos, "reportDashboard.json", dashboardContracts);
        }
    }

    public void addDocumentation(ZipOutputStream zos) throws IOException {
        List<DocumentationContract> documentationContracts = documentationService.getAll();
        if (!documentationContracts.isEmpty()) {
            addFileToZip(zos, "documentations.json", documentationContracts);
        }
    }

    public void addTaskType(ZipOutputStream zos) throws IOException {
        List<TaskTypeContract> taskTypeContracts = taskTypeService.getAll();
        if (!taskTypeContracts.isEmpty()) {
            addFileToZip(zos, "taskType.json", taskTypeContracts);
        }
    }

    public void addTaskStatus(ZipOutputStream zos) throws IOException {
        List<TaskStatusContract> taskStatusContracts = taskStatusService.getAll();
        if (!taskStatusContracts.isEmpty()) {
            addFileToZip(zos, "taskStatus.json", taskStatusContracts);
        }
    }

    public void addApplicationMenus(ZipOutputStream zos) throws IOException {
        addFileToZip(zos, "menuItem.json", menuItemService.findAll().stream().map(MenuItemContract::new).collect(Collectors.toList()));
    }

    private void addFileToZip(ZipOutputStream zos, String fileName, Object fileContent) throws IOException {
        ZipEntry entry = new ZipEntry(fileName);
        zos.putNextEntry(entry);
        if (fileContent != null) {
            PrettyPrinter prettyPrinter = new DefaultPrettyPrinter();
            byte[] bytes = ObjectMapperSingleton.getObjectMapper().writer(prettyPrinter).writeValueAsBytes(fileContent);
            zos.write(bytes);
        }
        zos.closeEntry();
    }

    private void addIconToZip(ZipOutputStream zos, String fileName, byte[] bytes) throws IOException {
        ZipEntry entry = new ZipEntry(fileName);
        zos.putNextEntry(entry);
        if (bytes != null) {
            zos.write(bytes);
        }
        zos.closeEntry();
    }

    private void addDirectoryToZip(ZipOutputStream zos, String directoryName) throws IOException {
        ZipEntry entry = new ZipEntry(String.format("%s/", directoryName));
        zos.putNextEntry(entry);
        zos.closeEntry();
    }


    public void deleteTransactionalData() {
        JpaRepository[] transactionalRepositories = {
                newsRepository,
                commentRepository,
                commentThreadRepository,
                entityApprovalStatusRepository,
                ruleFailureTelemetryRepository,
                identifierAssignmentRepository,
                syncTelemetryRepository,
                videoTelemetricRepository,
                groupSubjectRepository,
                individualRelationshipRepository,
                checklistItemRepository,
                checklistRepository,
                programEncounterRepository,
                programEnrolmentRepository,
                encounterRepository,
                subjectMigrationRepository,
                individualRepository
        };

        Arrays.asList(transactionalRepositories).forEach(this::deleteAll);
    }

    public void deleteMetadata() {
        JpaRepository[] metadataRepositories = {
                groupPrivilegeRepository,
                groupRoleRepository,
                checklistItemDetailRepository,
                checklistDetailRepository,
                identifierUserAssignmentRepository,
                identifierSourceRepository,
                individualRelationGenderMappingRepository,
                individualRelationshipTypeRepository,
                individualRelationRepository,
                formMappingRepository,
                formElementRepository,
                formElementGroupRepository,
                formRepository,
                conceptAnswerRepository,
                conceptRepository,
                operationalEncounterTypeRepository,
                encounterTypeRepository,
                operationalProgramRepository,
                programRepository,
                operationalSubjectTypeRepository,
                subjectTypeRepository,
                organisationConfigRepository,
                translationRepository,
                videoRepository,
                dashboardSectionCardMappingRepository,
                cardRepository,
                dashboardSectionRepository,
                groupDashboardRepository,
                dashboardRepository,
                msg91ConfigRepository
        };

        Arrays.asList(metadataRepositories).forEach(this::deleteAll);
        String defaultGroupName = "Everyone";
        userGroupRepository.deleteAllByGroupIsNotIn(groupRepository.findAllByName(defaultGroupName));
        groupRepository.deleteAllByNameNot(defaultGroupName);
    }

    private void deleteAll(JpaRepository repository) {
        repository.deleteAllInBatch();
    }

    public void deleteMediaContent(boolean deleteMetadata) {
        try {
            s3Service.deleteOrgMedia(deleteMetadata);
        } catch (Exception e) {
            logger.info("Error while deleting the media files, skipping.");
        }
    }
}
