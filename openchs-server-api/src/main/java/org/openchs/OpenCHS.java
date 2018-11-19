package org.openchs;

import org.openchs.application.FormElement;
import org.openchs.application.FormElementGroup;
import org.openchs.application.FormMapping;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.domain.*;
import org.openchs.domain.individualRelationship.IndividualRelationGenderMapping;
import org.openchs.domain.individualRelationship.IndividualRelationshipType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;

import java.util.stream.Collectors;

@SpringBootApplication
public class OpenCHS {
    private final ProgramRepository programRepository;
    private final EncounterTypeRepository encounterTypeRepository;

    @Autowired
    public OpenCHS(ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository) {
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
    }

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(OpenCHS.class);
        app.run(args);
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
                resource.add(new Link(formMapping.getForm().getUuid(), "formUUID"));
                Long entityId = formMapping.getEntityId();
                if (entityId != null) {
                    Program program = programRepository.findOne(entityId);
                    resource.add(new Link(program.getUuid(), "entityUUID"));
                }

                Long observationsTypeEntityId = formMapping.getObservationsTypeEntityId();
                if (observationsTypeEntityId != null) {
                    EncounterType encounterType = encounterTypeRepository.findOne(observationsTypeEntityId);
                    resource.add(new Link(encounterType.getUuid(), "observationsTypeEntityUUID"));
                }
                return resource;
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
                resource.add(new Link(rule.getForm().getUuid(), "formUUID"));
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

    @Bean
    public ResourceProcessor<Resource<ParentLocationMapping>> locationMappingProcessor() {
        return new ResourceProcessor<Resource<ParentLocationMapping>>() {
            @Override
            public Resource<ParentLocationMapping> process(Resource<ParentLocationMapping> resource) {
                ParentLocationMapping content = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(content.getLocation().getUuid(), "locationUUID"));
                resource.add(new Link(content.getParentLocation().getUuid(), "parentLocationUUID"));
                return resource;
            }
        };
    }
}