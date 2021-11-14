package org.avni.web;

import org.avni.application.Form;
import org.avni.application.FormMapping;
import org.avni.dao.application.FormMappingRepository;
import org.avni.dao.application.FormRepository;
import org.avni.domain.Concept;
import org.avni.domain.JsonObject;
import org.avni.report.AvniReportRepository;
import org.avni.report.ReportService;
import org.avni.util.BadRequestError;
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
    private final FormRepository formRepository;

    @Autowired
    public ReportingController(FormMappingRepository formMappingRepository,
                               AvniReportRepository avniReportRepository,
                               ReportService reportService, FormRepository formRepository) {
        this.formMappingRepository = formMappingRepository;
        this.avniReportRepository = avniReportRepository;
        this.reportService = reportService;
        this.formRepository = formRepository;
    }

    @RequestMapping(value = "/report/aggregate/codedConcepts", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public List<JsonObject> getReportData(@RequestParam(value = "formMappingId", required = false) Long formMappingId,
                                          @RequestParam(value="formUUID", required = false) String formUUID) {
        if (formMappingId == null && formUUID == null) {
            throw new BadRequestError("One of formMappingId or formUUID is required");
        }

        FormMapping formMapping;
        if (formMappingId != null) {
            formMapping = formMappingRepository.findById(formMappingId).orElse(null);
        } else {
            Form form = formRepository.findByUuid(formUUID);
            formMapping = formMappingRepository.findFirstByForm(form);
        }

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
    public JsonObject getRegistrationAggregate(@RequestParam(value = "startDate", required = false) String startDate,
                                               @RequestParam(value = "endDate", required = false) String endDate,
                                               @RequestParam(value = "subjectTypeIds", required = false, defaultValue = "") List<Long> subjectTypeIds,
                                               @RequestParam(value = "programIds", required = false, defaultValue = "") List<Long> programIds,
                                               @RequestParam(value = "encounterTypeIds", required = false, defaultValue = "") List<Long> encounterTypeIds) {
        return new JsonObject()
                .with("registrations", reportService.allRegistrations(startDate, endDate, subjectTypeIds))
                .with("enrolments", reportService.allEnrolments(startDate, endDate, programIds))
                .with("completedVisits", reportService.completedVisits(startDate, endDate, encounterTypeIds))
                .with("daywiseActivities", reportService.dailyActivities(startDate, endDate, subjectTypeIds, programIds, encounterTypeIds))
                .with("cancelledVisits", reportService.cancelledVisits(startDate, endDate, encounterTypeIds))
                .with("onTimeVisits", reportService.onTimeVisits(startDate, endDate, encounterTypeIds))
                .with("programExits", reportService.programExits(startDate, endDate, programIds));
    }
}
