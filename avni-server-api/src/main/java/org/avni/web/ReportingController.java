package org.avni.web;

import org.avni.application.FormMapping;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.Concept;
import org.avni.domain.JsonObject;
import org.avni.report.AvniReportRepository;
import org.avni.report.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ReportingController {

    private final FormMappingRepository formMappingRepository;
    private final AvniReportRepository avniReportRepository;
    private final ReportService reportService;

    @Autowired
    public ReportingController(FormMappingRepository formMappingRepository,
                               AvniReportRepository avniReportRepository,
                               ReportService reportService) {
        this.formMappingRepository = formMappingRepository;
        this.avniReportRepository = avniReportRepository;
        this.reportService = reportService;
    }


    @RequestMapping(value = "/report/aggregate/codedConcepts", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public List<JsonObject> getReportData(@RequestParam("formMappingId") Long formMappingId) {
        FormMapping formMapping = formMappingRepository.findById(formMappingId).orElse(null);
        if (formMapping == null) {
            throw new EntityNotFoundException(String.format("Form mapping not found for ID %d", formMappingId));
        }
        return formMapping.getForm().getAllCodedFormElements()
                .stream()
                .map(fe -> {
                    Concept concept = fe.getConcept();
                    return new JsonObject()
                            .with("concept", concept)
                            .with("data", avniReportRepository.generateAggregatesForCodedConcept(concept, formMapping))
                            .with("isPie", fe.isMandatory() && concept.isCoded());
                })
                .collect(Collectors.toList());
    }

    @RequestMapping(value = "/report/aggregate/activities", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public JsonObject getRegistrationAggregate() {
        return new JsonObject()
                .with("registrations", reportService.allRegistrations())
                .with("enrolments", reportService.allEnrolments())
                .with("completedVisits", reportService.completedVisits())
                .with("daywiseActivities", reportService.dailyActivities());
    }
}
