package org.avni.server.visitor;

import org.avni.server.application.FormElement;
import org.avni.server.application.FormMapping;
import org.avni.server.application.projections.ReportingViewProjection;
import org.avni.server.dao.ImplementationRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.Program;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.metadata.MetaDataVisitor;
import org.avni.server.reporting.ReportingViews;
import org.avni.server.service.ViewNameGenerator;
import org.avni.server.web.response.ReportingViewResponse;

import java.util.ArrayList;
import java.util.List;

public class GetReportingViewSourceVisitor implements MetaDataVisitor {
    private final List<ReportingViewProjection> allViews;
    private final ViewNameGenerator viewNameGenerator;
    private List<ReportingViewResponse> reportingViewResponses = new ArrayList<>();
    private FormMappingRepository formMappingRepository;

    public GetReportingViewSourceVisitor(ImplementationRepository implementationRepository, Organisation organisation, FormMappingRepository formMappingRepository) {
        this.formMappingRepository = formMappingRepository;
        allViews = implementationRepository.getAllViewsInSchema(organisation.getSchemaName());
        this.viewNameGenerator = new ViewNameGenerator(organisation);
    }

    public List<ReportingViewResponse> getReportingViewResponses() {
        return reportingViewResponses;
    }

    @Override
    public void visit(SubjectType subjectType) {
        String viewName = viewNameGenerator.getSubjectRegistrationViewName(subjectType);
        ReportingViewProjection reportingViewProjection = getReportingViewProjection(viewName);
        if (reportingViewProjection != null) {
            FormMapping formMapping = formMappingRepository.getRegistrationFormMapping(subjectType);
            addToResponse(reportingViewProjection, formMapping);
        }
    }

    @Override
    public void visit(SubjectType subjectType, Program program) {
        String viewName = viewNameGenerator.getProgramEnrolmentViewName(subjectType, program.getOperationalProgramName());
        ReportingViewProjection reportingViewProjection = getReportingViewProjection(viewName);
        if (reportingViewProjection != null) {
            FormMapping formMapping = formMappingRepository.getProgramEnrolmentFormMapping(subjectType, program);
            addToResponse(reportingViewProjection, formMapping);
        }

        FormMapping formMapping = formMappingRepository.getProgramExitFormMapping(subjectType, program);
        if (formMapping == null) return;
        viewName = viewNameGenerator.getProgramEnrolmentExitViewName(subjectType, program.getOperationalProgramName());
        reportingViewProjection = getReportingViewProjection(viewName);
        if (reportingViewProjection != null) {
            addToResponse(reportingViewProjection, formMapping);
        }
    }

    @Override
    public void visit(SubjectType subjectType, Program program, EncounterType encounterType) {
        String viewName = viewNameGenerator.getProgramEncounterViewName(subjectType, program, encounterType.getOperationalEncounterTypeName());
        ReportingViewProjection reportingViewProjection = getReportingViewProjection(viewName);
        if (reportingViewProjection != null) {
            FormMapping formMapping = formMappingRepository.getProgramEncounterFormMapping(subjectType, program, encounterType);
            addToResponse(reportingViewProjection, formMapping);
        }

        FormMapping formMapping = formMappingRepository.getProgramEncounterCancelFormMapping(subjectType, program, encounterType);
        if (formMapping == null) return;

        viewName = viewNameGenerator.getProgramEncounterCancelViewName(subjectType, program, encounterType.getOperationalEncounterTypeName());
        reportingViewProjection = getReportingViewProjection(viewName);
        if (reportingViewProjection != null) {
            addToResponse(reportingViewProjection, formMapping);
        }
    }

    @Override
    public void visit(SubjectType subjectType, EncounterType encounterType) {
        String viewName = viewNameGenerator.getGeneralEncounterViewName(subjectType, encounterType.getOperationalEncounterTypeName());
        ReportingViewProjection reportingViewProjection = getReportingViewProjection(viewName);
        if (reportingViewProjection != null) {
            FormMapping formMapping = formMappingRepository.getGeneralEncounterFormMapping(subjectType, encounterType);
            addToResponse(reportingViewProjection, formMapping);
        }

        FormMapping formMapping = formMappingRepository.getGeneralEncounterCancelFormMapping(subjectType, encounterType);
        if (formMapping == null) return;
        viewName = viewNameGenerator.getGeneralEncounterCancelViewName(subjectType, encounterType.getOperationalEncounterTypeName());
        reportingViewProjection = getReportingViewProjection(viewName);
        if (reportingViewProjection != null) {
            addToResponse(reportingViewProjection, formMapping);
        }
    }

    private static String generateComment(FormMapping formMapping) {
        StringBuilder stringBuilder = new StringBuilder();
        List<FormElement> allFormElements = formMapping.getForm().getAllFormElements();
        allFormElements.stream().filter(formElement -> formElement.getConcept().isViewColumnNameTruncated()).forEach(formElement -> stringBuilder.append(String.format("-- %s >> %s\n", formElement.getConcept().getName(), formElement.getConcept().getViewColumnName())));
        return stringBuilder.toString();
    }

    private ReportingViewProjection getReportingViewProjection(String viewName) {
        return allViews.stream().filter(x -> x.getViewname().equals(viewName)).findFirst().orElse(null);
    }

    private void addToResponse(ReportingViewProjection reportingViewProjection, FormMapping formMapping) {
        String comment = generateComment(formMapping);
        StringBuilder stringBuilder = new StringBuilder(comment);
        stringBuilder.append(reportingViewProjection.getDefinition());
        ReportingViewResponse reportingViewResponse = new ReportingViewResponse(reportingViewProjection.getViewname(), ReportingViews.legacyViews.contains(reportingViewProjection.getViewname()), stringBuilder.toString());
        reportingViewResponses.add(reportingViewResponse);
    }
}
