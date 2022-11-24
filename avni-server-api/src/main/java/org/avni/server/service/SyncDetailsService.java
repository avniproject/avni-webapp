package org.avni.server.service;

import org.avni.server.application.FormMapping;
import org.avni.server.dao.ChecklistDetailRepository;
import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.dao.OperationalSubjectTypeRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.domain.ChecklistDetail;
import org.avni.server.domain.GroupPrivileges;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.SyncableItem;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class SyncDetailsService {
    private OperationalSubjectTypeRepository subjectTypeRepository;
    private FormMappingRepository formMappingRepository;
    private ChecklistDetailRepository checklistDetailRepository;
    private OrganisationConfigService organisationConfigService;
    private GroupPrivilegeService groupPrivilegeService;


    public SyncDetailsService(OperationalSubjectTypeRepository subjectTypeRepository1, EncounterTypeRepository encounterTypeRepository, FormMappingRepository formMappingRepository, ChecklistDetailRepository checklistDetailRepository, OrganisationConfigService organisationConfigService, GroupPrivilegeService groupPrivilegeService) {
        this.subjectTypeRepository = subjectTypeRepository1;
        this.formMappingRepository = formMappingRepository;
        this.checklistDetailRepository = checklistDetailRepository;
        this.organisationConfigService = organisationConfigService;
        this.groupPrivilegeService = groupPrivilegeService;
    }

    @Transactional
    public Set<SyncableItem> getAllSyncableItems() {
        List<SubjectType> subjectTypes = subjectTypeRepository.findAll()
                .stream()
                .map(operationalSubjectType -> operationalSubjectType.getSubjectType())
                .collect(Collectors.toList());

        List<FormMapping> generalEncounters = formMappingRepository.getAllGeneralEncounterFormMappings();
        List<FormMapping> programEncounters = formMappingRepository.getAllProgramEncounterFormMappings();
        List<FormMapping> programEnrolments = formMappingRepository.getAllProgramEnrolmentFormMappings();
        List<ChecklistDetail> checklistDetails = checklistDetailRepository.findAll();
        GroupPrivileges groupPrivileges = groupPrivilegeService.getGroupPrivileges();

        HashSet<SyncableItem> syncableItems = new HashSet<>();

        subjectTypes.forEach(subjectType -> {
            if (!groupPrivileges.hasPrivilege("View subject", subjectType, null, null, null)) {
                return;
            }
            addToSyncableItems(syncableItems, "Individual", subjectType.getUuid());
            addToSyncableItems(syncableItems, "SubjectMigration", subjectType.getUuid());
            addToSyncableItems(syncableItems, "SubjectProgramEligibility", subjectType.getUuid());
            if (subjectType.isPerson()) {
                addToSyncableItems(syncableItems, "IndividualRelationship", subjectType.getUuid());
            }
            if (subjectType.isGroup()) {
                addToSyncableItems(syncableItems, "GroupSubject", subjectType.getUuid());
            }
            if (organisationConfigService.isCommentEnabled()) {
                addToSyncableItems(syncableItems, "Comment", subjectType.getUuid());
                addToSyncableItems(syncableItems, "CommentThread", subjectType.getUuid());
            }
        });
        generalEncounters.forEach(formMapping -> {
            if (!groupPrivileges.hasPrivilege("View visit", formMapping.getSubjectType(), null, formMapping.getEncounterType(), null)) {
                return;
            }
            addToSyncableItems(syncableItems, "Encounter", formMapping.getEncounterTypeUuid());
        });
        programEncounters.forEach(formMapping -> {
            if (!groupPrivileges.hasPrivilege("View visit", formMapping.getSubjectType(), formMapping.getProgram(), formMapping.getEncounterType(), null)) {
                return;
            }
            addToSyncableItems(syncableItems, "ProgramEncounter", formMapping.getEncounterTypeUuid());
        });
        programEnrolments.forEach(formMapping -> {
            if (!groupPrivileges.hasPrivilege("View enrolment details", formMapping.getSubjectType(), formMapping.getProgram(), formMapping.getEncounterType(), null)) {
                return;
            }
            addToSyncableItems(syncableItems, "ProgramEnrolment", formMapping.getProgramUuid());
        });

        checklistDetails.forEach(checklistDetail -> {
            if (subjectTypes.stream().anyMatch(subjectType -> groupPrivileges.hasPrivilege("View checklist", subjectType, null, null,checklistDetail))) {
                addToSyncableItems(syncableItems, "Checklist", checklistDetail.getUuid());
                addToSyncableItems(syncableItems, "ChecklistItem", checklistDetail.getUuid());
            }
        });
        addToSyncableItems(syncableItems, Arrays.asList("IdentifierAssignment", "ChecklistDetail", "Rule", "RuleDependency",
                "Form", "FormMapping", "EncounterType", "Program", "ProgramOutcome", "Gender", "IndividualRelation",
                "IndividualRelationGenderMapping", "IndividualRelationshipType", "Concept", "ProgramConfig", "Video",
                "SubjectType", "ChecklistItemDetail", "FormElementGroup", "FormElement", "ConceptAnswer",
                "IdentifierSource", "OrganisationConfig", "PlatformTranslation", "Translation", "Groups",
                "MyGroups", "GroupPrivileges", "Extension", "GroupRole", "LocationHierarchy", "ReportCard",
                "Dashboard", "DashboardSection", "DashboardSectionCardMapping", "ApprovalStatus", "GroupDashboard",
                "EntityApprovalStatus", "News", "UserInfo", "Privilege", "StandardReportCardType", "Documentation", "DocumentationItem",
                "Task", "TaskType", "TaskStatus", "TaskUnAssignment", "UserSubjectAssignment", "LocationMapping"
        ));

        return syncableItems;
    }

    private boolean addToSyncableItems(HashSet<SyncableItem> syncableItems, String entityName, String uuid) {
        return syncableItems.add(new SyncableItem(entityName, uuid));
    }

    private void addToSyncableItems(HashSet<SyncableItem> syncableItems, List<String> entityNames) {
        entityNames.forEach(entityName -> syncableItems.add(new SyncableItem(entityName, "")));
    }
}
