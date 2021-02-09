package org.openchs.visitor;

import org.flywaydb.core.internal.util.ExceptionUtils;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Organisation;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;
import org.openchs.domain.metadata.MetaDataVisitor;
import org.openchs.reporting.ViewGenService;
import org.openchs.service.ViewNameGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CreateReportingViewVisitor implements MetaDataVisitor {
    private ViewGenService viewGenService;
    private OrganisationRepository organisationRepository;
    private static Logger logger = LoggerFactory.getLogger(CreateReportingViewVisitor.class);

    public CreateReportingViewVisitor(ViewGenService viewGenService, OrganisationRepository organisationRepository) {
        this.viewGenService = viewGenService;
        this.organisationRepository = organisationRepository;
    }

    private ViewNameGenerator getViewNameGenerator(Long organisationId) {
        Organisation organisation = organisationRepository.findOne(organisationId);
        return new ViewNameGenerator(organisation);
    }

    @Override
    public void visit(SubjectType subjectType) {
        ViewNameGenerator viewNameGenerator = getViewNameGenerator(subjectType.getOperationalSubjectType().getOrganisationId());
        Map<String, String> registrationViewMap = viewGenService.registrationViews(subjectType.getOperationalSubjectTypeName(), false);
        String registrationViewName = viewNameGenerator.getSubjectRegistrationViewName(subjectType);
        createView(registrationViewMap.get("Registration"), registrationViewName);
    }

    @Override
    public void visit(SubjectType subjectType, Program program) {
        ViewNameGenerator viewNameGenerator = getViewNameGenerator(subjectType.getOperationalSubjectType().getOrganisationId());
        Map<String, String> programEnrolmentSqlMap = viewGenService.enrolmentViews(subjectType.getOperationalSubjectTypeName(), program.getOperationalProgramName());
        programEnrolmentSqlMap.forEach((prg, programSql) -> {
            String programEnrolmentViewName = viewNameGenerator.getProgramEnrolmentViewName(subjectType, prg);
            createView(programSql, programEnrolmentViewName);
        });
    }

    @Override
    public void visit(SubjectType subjectType, Program program, EncounterType encounterType) {
        ViewNameGenerator viewNameGenerator = getViewNameGenerator(subjectType.getOperationalSubjectType().getOrganisationId());
        Map<String, String> programEncounterViewMap = viewGenService.getSqlsFor(program.getOperationalProgramName(), null, false, subjectType.getOperationalSubjectTypeName());
        programEncounterViewMap.forEach((et, programEncounterSql) -> {
            String programEncounterViewName = viewNameGenerator.getProgramEncounterViewName(subjectType, program, et);
            createView(programEncounterSql, programEncounterViewName);
        });
    }

    @Override
    public void visit(SubjectType subjectType, EncounterType encounterType) {
        ViewNameGenerator viewNameGenerator = getViewNameGenerator(subjectType.getOperationalSubjectType().getOrganisationId());
        Map<String, String> generalEncounterViewMap = viewGenService.getSqlsFor(null, encounterType.getOperationalEncounterTypeName(), false, subjectType.getOperationalSubjectTypeName());
        generalEncounterViewMap.forEach((et, etSql) -> {
            String generalEncounterViewName = viewNameGenerator.getGeneralEncounterViewName(subjectType, et);
            createView(etSql, generalEncounterViewName);
        });
    }

    private void createView(String viewSql, String viewName) {
        try {
            organisationRepository.createView(viewName, viewSql);
        } catch (Exception e) {
            logger.error("Error while creating view {}", viewName, e);
            logger.error(String.format("View SQL: %s", viewSql));
            throw new RuntimeException(String.format("Error while creating view %s, %s", viewName, ExceptionUtils.getRootCause(e).getMessage()));
        }
    }
}