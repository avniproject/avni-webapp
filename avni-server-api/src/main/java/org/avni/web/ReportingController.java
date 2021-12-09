package org.avni.web;

import org.avni.application.Form;
import org.avni.application.FormMapping;
import org.avni.dao.LocationRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.dao.application.FormRepository;
import org.avni.domain.AddressLevel;
import org.avni.domain.CHSBaseEntity;
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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
public class ReportingController {

    private final FormMappingRepository formMappingRepository;
    private final AvniReportRepository avniReportRepository;
    private final ReportService reportService;
    private final FormRepository formRepository;
    private final LocationRepository locationRepository;

    @Autowired
    public ReportingController(FormMappingRepository formMappingRepository,
                               AvniReportRepository avniReportRepository,
                               ReportService reportService,
                               FormRepository formRepository,
                               LocationRepository locationRepository) {
        this.formMappingRepository = formMappingRepository;
        this.avniReportRepository = avniReportRepository;
        this.reportService = reportService;
        this.formRepository = formRepository;
        this.locationRepository = locationRepository;
    }

    @RequestMapping(value = "/report/aggregate/codedConcepts", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public List<JsonObject> getReportData(@RequestParam(value = "formMappingId", required = false) Long formMappingId,
                                          @RequestParam(value="formUUID", required = false) String formUUID,
                                          @RequestParam(value = "startDate", required = false) String startDate,
                                          @RequestParam(value = "endDate", required = false) String endDate,
                                          @RequestParam(value = "locationIds", required = false, defaultValue = "") List<Long> locationIds) {
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
        List<Long> lowestLocationIds = getLocations(locationIds);
        return formMapping.getForm().getAllCodedFormElements()
                .stream()
                .map(fe -> {
                    Concept concept = fe.getConcept();
                    return new JsonObject()
                            .with("concept", concept)
                            .with("data", avniReportRepository.generateAggregatesForCodedConcept(concept, formMapping, startDate, endDate, lowestLocationIds))
                            .with("isPie", fe.isMandatory() && concept.isCoded());
                })
                .collect(Collectors.toList());
    }

    @RequestMapping(value = "/report/aggregate/activities", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public JsonObject getRegistrationAggregate(@RequestParam(value = "startDate", required = false) String startDate,
                                               @RequestParam(value = "endDate", required = false) String endDate,
                                               @RequestParam(value = "locationIds", required = false, defaultValue = "") List<Long> locationIds,
                                               @RequestParam(value = "subjectTypeIds", required = false, defaultValue = "") List<Long> subjectTypeIds,
                                               @RequestParam(value = "programIds", required = false, defaultValue = "") List<Long> programIds,
                                               @RequestParam(value = "encounterTypeIds", required = false, defaultValue = "") List<Long> encounterTypeIds) {
        List<Long> lowestLocationIds = getLocations(locationIds);
        return new JsonObject()
                .with("registrations", reportService.allRegistrations(startDate, endDate, subjectTypeIds, lowestLocationIds))
                .with("enrolments", reportService.allEnrolments(startDate, endDate, programIds, lowestLocationIds))
                .with("completedVisits", reportService.completedVisits(startDate, endDate, encounterTypeIds, lowestLocationIds))
                .with("daywiseActivities", reportService.dailyActivities(startDate, endDate, subjectTypeIds, programIds, encounterTypeIds, lowestLocationIds))
                .with("cancelledVisits", reportService.cancelledVisits(startDate, endDate, encounterTypeIds, lowestLocationIds))
                .with("onTimeVisits", reportService.onTimeVisits(startDate, endDate, encounterTypeIds, lowestLocationIds))
                .with("programExits", reportService.programExits(startDate, endDate, programIds, lowestLocationIds));
    }

    private List<Long> getLocations(List<Long> addressIds) {
        if (addressIds.isEmpty()) return new ArrayList<>();
        List<AddressLevel> selectedAddressLevels = locationRepository.findAllById(addressIds);
        List<AddressLevel> allAddressLevels = locationRepository.findAllByIsVoidedFalse();
        return selectedAddressLevels
                .stream()
                .flatMap(al -> findLowestAddresses(al, allAddressLevels))
                .map(CHSBaseEntity::getId)
                .collect(Collectors.toList());
    }

    private Stream<AddressLevel> findLowestAddresses(AddressLevel selectedAddress, List<AddressLevel> allAddresses) {
        return allAddresses
                .stream()
                .filter(al -> al.getLineage().startsWith(selectedAddress.getLineage()));
    }
}
