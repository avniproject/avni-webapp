package org.avni;

import org.avni.server.application.Form;
import org.avni.server.application.FormElement;
import org.avni.server.application.FormElementGroup;
import org.avni.server.application.FormMapping;
import org.avni.server.domain.*;
import org.avni.server.domain.individualRelationship.IndividualRelationGenderMapping;
import org.avni.server.domain.individualRelationship.IndividualRelationshipType;
import org.avni.server.domain.task.TaskStatus;
import org.avni.server.importer.batch.JobService;
import org.avni.server.service.EntityApprovalStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;

import java.util.stream.Collectors;

@SpringBootApplication
public class Avni {
    private final JobService jobService;

    @Autowired
    public Avni(JobService jobService) {
        this.jobService = jobService;
    }

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Avni.class);
        app.setWebApplicationType(WebApplicationType.SERVLET);
        app.run(args);
    }

    @Bean
    public ResourceProcessor<Resource<TaskStatus>> TaskStatusProcessor() {
        return new ResourceProcessor<Resource<TaskStatus>>() {
            @Override
            public Resource<TaskStatus> process(Resource<TaskStatus> resource) {
                TaskStatus taskStatus = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(taskStatus.getTaskType().getUuid(), "taskTypeUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<DashboardSectionCardMapping>> DashboardSectionCardMappingProcessor() {
        return new ResourceProcessor<Resource<DashboardSectionCardMapping>>() {
            @Override
            public Resource<DashboardSectionCardMapping> process(Resource<DashboardSectionCardMapping> resource) {
                DashboardSectionCardMapping dashboardSectionCardMapping = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(dashboardSectionCardMapping.getCard().getUuid(), "cardUUID"));
                resource.add(new Link(dashboardSectionCardMapping.getDashboardSection().getUuid(), "dashboardSectionUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<OperationalSubjectType>> OperationalSubjectTypeProcessor() {
        return new ResourceProcessor<Resource<OperationalSubjectType>>() {
            @Override
            public Resource<OperationalSubjectType> process(Resource<OperationalSubjectType> resource) {
                OperationalSubjectType operationalSubjectType = resource.getContent();
                resource.removeLinks();
                if (operationalSubjectType.getSubjectType().getSyncRegistrationConcept1() != null) {
                    resource.add(new Link(operationalSubjectType.getSubjectType().getSyncRegistrationConcept1(), "syncRegistrationConcept1"));
                }
                if (operationalSubjectType.getSubjectType().getSyncRegistrationConcept2() != null) {
                    resource.add(new Link(operationalSubjectType.getSubjectType().getSyncRegistrationConcept2(), "syncRegistrationConcept2"));
                }
                if (operationalSubjectType.getSubjectType().getNameHelpText() != null) {
                    resource.add(new Link(operationalSubjectType.getSubjectType().getNameHelpText(), "nameHelpText"));
                }
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<GroupDashboard>> GroupDashboardProcessor() {
        return new ResourceProcessor<Resource<GroupDashboard>>() {
            @Override
            public Resource<GroupDashboard> process(Resource<GroupDashboard> resource) {
                GroupDashboard groupDashboard = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(groupDashboard.getGroup().getUuid(), "groupUUID"));
                resource.add(new Link(groupDashboard.getDashboard().getUuid(), "dashboardUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<EntityApprovalStatus>> EntityApprovalStatusProcessor() {
        return new ResourceProcessor<Resource<EntityApprovalStatus>>() {
            @Autowired
            private EntityApprovalStatusService entityApprovalStatusService;

            @Override
            public Resource<EntityApprovalStatus> process(Resource<EntityApprovalStatus> resource) {
                EntityApprovalStatus entityApprovalStatus = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(entityApprovalStatusService.getEntityUuid(entityApprovalStatus), "entityUUID"));
                resource.add(new Link(entityApprovalStatus.getApprovalStatus().getUuid(), "approvalStatusUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<Card>> CardProcessor() {
        return new ResourceProcessor<Resource<Card>>() {
            @Override
            public Resource<Card> process(Resource<Card> resource) {
                Card card = resource.getContent();
                StandardReportCardType standardReportCardType = card.getStandardReportCardType();
                resource.removeLinks();
                if (standardReportCardType != null) {
                    resource.add(new Link(standardReportCardType.getUuid(), "standardReportCardUUID"));
                }
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<IndividualRelationshipType>> IndividualRelationshipTypeProcessor() {
        return new ResourceProcessor<Resource<IndividualRelationshipType>>() {
            @Override
            public Resource<IndividualRelationshipType> process(Resource<IndividualRelationshipType> resource) {
                IndividualRelationshipType individualRelationshipType = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(individualRelationshipType.getIndividualAIsToB().getUuid(), "individualAIsToBRelationUUID"));
                resource.add(new Link(individualRelationshipType.getIndividualBIsToA().getUuid(), "individualBIsToBRelationUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<IndividualRelationGenderMapping>> IndividualRelationGenderMappingProcessor() {
        return new ResourceProcessor<Resource<IndividualRelationGenderMapping>>() {
            @Override
            public Resource<IndividualRelationGenderMapping> process(Resource<IndividualRelationGenderMapping> resource) {
                IndividualRelationGenderMapping individualRelationGenderMapping = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(individualRelationGenderMapping.getRelation().getUuid(), "relationUUID"));
                resource.add(new Link(individualRelationGenderMapping.getGender().getUuid(), "genderUUID"));
                return resource;
            }
        };
    }


    @Bean
    public ResourceProcessor<Resource<FormElement>> formElementProcessor() {
        return new ResourceProcessor<Resource<FormElement>>() {
            @Override
            public Resource<FormElement> process(Resource<FormElement> resource) {
                FormElement formElement = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(formElement.getFormElementGroup().getUuid(), "formElementGroupUUID"));
                resource.add(new Link(formElement.getConcept().getUuid(), "conceptUUID"));
                if (formElement.getGroup() != null) {
                    resource.add(new Link(formElement.getGroup().getUuid(), "groupQuestionUUID"));
                }
                if (formElement.getDocumentation() != null) {
                    resource.add(new Link(formElement.getDocumentation().getUuid(), "documentationUUID"));
                }
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<FormElementGroup>> formElementGroupProcessor() {
        return new ResourceProcessor<Resource<FormElementGroup>>() {
            @Override
            public Resource<FormElementGroup> process(Resource<FormElementGroup> resource) {
                FormElementGroup formElementGroup = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(formElementGroup.getForm().getUuid(), "formUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<DocumentationItem>> documentationItemsProcessor() {
        return new ResourceProcessor<Resource<DocumentationItem>>() {
            @Override
            public Resource<DocumentationItem> process(Resource<DocumentationItem> resource) {
                DocumentationItem documentationItem = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(documentationItem.getDocumentation().getUuid(), "documentationUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<ProgramOrganisationConfig>> programOrganisationConfig() {
        return new ResourceProcessor<Resource<ProgramOrganisationConfig>>() {
            @Override
            public Resource<ProgramOrganisationConfig> process(Resource<ProgramOrganisationConfig> resource) {
                ProgramOrganisationConfig content = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(content.getProgram().getUuid(), "programUUID"));
                String conceptUUIDs = content.getAtRiskConcepts().stream().map(CHSEntity::getUuid).collect(Collectors.joining(","));
                resource.add(new Link(conceptUUIDs, "conceptUUIDs"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<ConceptAnswer>> conceptAnswerProcessor() {
        return new ResourceProcessor<Resource<ConceptAnswer>>() {
            @Override
            public Resource<ConceptAnswer> process(Resource<ConceptAnswer> resource) {
                ConceptAnswer conceptAnswer = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(conceptAnswer.getConcept().getUuid(), "conceptUUID"));
                resource.add(new Link(conceptAnswer.getAnswerConcept().getUuid(), "conceptAnswerUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<FormMapping>> FormMappingProcessor() {
        return new ResourceProcessor<Resource<FormMapping>>() {
            @Override
            public Resource<FormMapping> process(Resource<FormMapping> resource) {
                FormMapping formMapping = resource.getContent();
                resource.removeLinks();
                Form form = formMapping.getForm();
                if (form != null) {
                    resource.add(new Link(formMapping.getForm().getUuid(), "formUUID"));


                    String programUuid = formMapping.getProgramUuid();
                    if (programUuid != null) {
                        resource.add(new Link(programUuid, "entityUUID"));
                    }

                    if (formMapping.getSubjectType() != null) {
                        resource.add(new Link(formMapping.getSubjectType().getUuid(), "subjectTypeUUID"));
                    }
                    if (formMapping.getTaskType() != null) {
                        resource.add(new Link(formMapping.getTaskTypeUuid(), "taskTypeUUID"));
                    }

                    String encounterTypeUuid = formMapping.getEncounterTypeUuid();
                    if (encounterTypeUuid != null) {
                        resource.add(new Link(encounterTypeUuid, "observationsTypeEntityUUID"));
                    }

                    return resource;
                }
                return null;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<Rule>> RuleProcessor() {
        return new ResourceProcessor<Resource<Rule>>() {
            @Override
            public Resource<Rule> process(Resource<Rule> resource) {
                Rule rule = resource.getContent();
                resource.removeLinks();
                RuledEntityType entityType = rule.getEntity().getType();
                String entityUUID = rule.getEntity().getUuid();
                String key = RuledEntityType.isForm(entityType) ? "formUUID"
                        : RuledEntityType.isProgram(entityType) ? "programUUID" : null;
                if (entityUUID != null && key != null) {
                    resource.add(new Link(entityUUID, key));
                }
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<ChecklistItemDetail>> ChecklistItemDetailProcessor() {
        return new ResourceProcessor<Resource<ChecklistItemDetail>>() {
            @Override
            public Resource<ChecklistItemDetail> process(Resource<ChecklistItemDetail> resource) {
                ChecklistItemDetail content = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(content.getChecklistDetail().getUuid(), "checklistDetailUUID"));
                resource.add(new Link(content.getConcept().getUuid(), "conceptUUID"));
                resource.add(new Link(content.getForm().getUuid(), "formUUID"));
                ChecklistItemDetail leadChecklistItemDetail = content.getLeadChecklistItemDetail();
                if (leadChecklistItemDetail != null) {
                    resource.add(new Link(leadChecklistItemDetail.getUuid(), "leadDetailUUID"));
                }
                return resource;
            }
        };
    }

    @EventListener(ApplicationReadyEvent.class)
    public void restartFailedJobs() throws Exception {
        jobService.retryJobsFailedInLast2Hours();
    }
}
