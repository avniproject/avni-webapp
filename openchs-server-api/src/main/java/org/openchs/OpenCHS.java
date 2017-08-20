package org.openchs;

import org.openchs.application.FormElement;
import org.openchs.application.FormElementGroup;
import org.openchs.application.FormMapping;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;

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
        SpringApplication.run(OpenCHS.class, args);
    }

    @Bean
    public ResourceProcessor<Resource<Individual>> individualProcessor() {
        return new ResourceProcessor<Resource<Individual>>() {
            @Override
            public Resource<Individual> process(Resource<Individual> resource) {
                Individual individual = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(individual.getAddressLevel().getUuid(), "addressUUID"));
                resource.add(new Link(individual.getGender().getUuid(), "genderUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<ProgramEncounter>> programEncounterProcessor() {
        return new ResourceProcessor<Resource<ProgramEncounter>>() {
            @Override
            public Resource<ProgramEncounter> process(Resource<ProgramEncounter> resource) {
                ProgramEncounter programEncounter = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(programEncounter.getEncounterType().getUuid(), "encounterTypeUUID"));
                resource.add(new Link(programEncounter.getProgramEnrolment().getUuid(), "programEnrolmentUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<Encounter>> encounterProcessor() {
        return new ResourceProcessor<Resource<Encounter>>() {
            @Override
            public Resource<Encounter> process(Resource<Encounter> resource) {
                Encounter encounter = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(encounter.getEncounterType().getUuid(), "encounterTypeUUID"));
                resource.add(new Link(encounter.getIndividual().getUuid(), "individualUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<ProgramEnrolment>> programEnrolmentProcessor() {
        return new ResourceProcessor<Resource<ProgramEnrolment>>() {
            @Override
            public Resource<ProgramEnrolment> process(Resource<ProgramEnrolment> resource) {
                ProgramEnrolment programEnrolment = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(programEnrolment.getProgram().getUuid(), "programUUID"));
                resource.add(new Link(programEnrolment.getIndividual().getUuid(), "individualUUID"));
                if (programEnrolment.getProgramOutcome() != null)
                    resource.add(new Link(programEnrolment.getProgramOutcome().getUuid(), "programOutcomeUUID"));
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
    public ResourceProcessor<Resource<Checklist>> ChecklistProcessor() {
        return new ResourceProcessor<Resource<Checklist>>() {
            @Override
            public Resource<Checklist> process(Resource<Checklist> resource) {
                Checklist checklist = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(checklist.getProgramEnrolment().getUuid(), "programEnrolmentUUID"));
                return resource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<ChecklistItem>> ChecklistItemProcessor() {
        return new ResourceProcessor<Resource<ChecklistItem>>() {
            @Override
            public Resource<ChecklistItem> process(Resource<ChecklistItem> resource) {
                ChecklistItem checklistItem = resource.getContent();
                resource.removeLinks();
                resource.add(new Link(checklistItem.getChecklist().getUuid(), "checklistUUID"));
                resource.add(new Link(checklistItem.getConcept().getUuid(), "conceptUUID"));
                return resource;
            }
        };
    }
}