package org.openchs.web;

import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.JsonObject;
import org.openchs.report.AggregateReportResult;
import org.openchs.report.CodedConceptReportGenerator;
import org.openchs.report.NonCodedConceptReportGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@RestController
public class ReportingController {

    private final FormMappingRepository formMappingRepository;
    private final ConceptRepository conceptRepository;
    private final CodedConceptReportGenerator codedConceptReportGenerator;
    private final NonCodedConceptReportGenerator nonCodedConceptReportGenerator;

    @Autowired
    public ReportingController(FormMappingRepository formMappingRepository,
                               ConceptRepository conceptRepository,
                               CodedConceptReportGenerator codedConceptReportGenerator,
                               NonCodedConceptReportGenerator nonCodedConceptReportGenerator) {
        this.formMappingRepository = formMappingRepository;
        this.conceptRepository = conceptRepository;
        this.codedConceptReportGenerator = codedConceptReportGenerator;
        this.nonCodedConceptReportGenerator = nonCodedConceptReportGenerator;
    }


    @RequestMapping(value = "/report/aggregate", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public JsonObject getReportData(@RequestParam("conceptId") Long conceptId,
                                    @RequestParam("formMappingId") Long formMappingId) {
        FormMapping formMapping = formMappingRepository.findById(formMappingId).orElse(null);
        if (formMapping == null) {
            throw new EntityNotFoundException(String.format("Form mapping not found for ID %d", formMappingId));
        }
        Concept concept = conceptRepository.findById(conceptId)
                .orElseThrow(() -> new EntityNotFoundException(String.format("Concept not found for ID %d", conceptId)));

        List<AggregateReportResult> aggregateReportResults = getAggregateReportResults(formMapping, concept);
        return new JsonObject()
                .with("conceptName", concept.getName())
                .with("data", aggregateReportResults)
                .with("isPie", isPieGraph(concept, formMapping.getForm()));
    }

    private Boolean isPieGraph(Concept concept, Form form) {
        FormElement formElement = form.getAllFormElements()
                .stream()
                .filter(fe -> fe.getConcept().getUuid().equals(concept.getUuid()))
                .findFirst()
                .get();
        return formElement.isMandatory() && concept.isCoded();
    }

    private List<AggregateReportResult> getAggregateReportResults(FormMapping formMapping, Concept concept) {
        if (concept.isCoded()) {
            return codedConceptReportGenerator.generateAggregateReport(concept, formMapping);
        } else
            return nonCodedConceptReportGenerator.generateAggregateReport(concept, formMapping);
    }
}
