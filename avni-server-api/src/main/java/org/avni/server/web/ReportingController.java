package org.avni.server.web;

import org.avni.server.application.Form;
import org.avni.server.application.FormMapping;
import org.avni.server.application.projections.VirtualCatchmentProjection;
import org.avni.server.dao.LocationRepository;
import org.avni.server.dao.UserGroupRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.dao.application.FormRepository;
import org.avni.server.domain.*;
import org.avni.server.report.AggregateReportResult;
import org.avni.server.report.AvniReportRepository;
import org.avni.server.report.ReportService;
import org.avni.server.report.UserActivityResult;
import org.avni.server.util.BadRequestError;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
public class ReportingController {

    private final FormMappingRepository formMappingRepository;
    private final AvniReportRepository avniReportRepository;
    private final ReportService reportService;
    private final FormRepository formRepository;
    private final LocationRepository locationRepository;
    private final UserGroupRepository userGroupRepository;
    private final UserRepository userRepository;

    @Autowired
    public ReportingController(FormMappingRepository formMappingRepository,
                               AvniReportRepository avniReportRepository,
                               ReportService reportService,
                               FormRepository formRepository,
                               LocationRepository locationRepository,
                               UserGroupRepository userGroupRepository,
                               UserRepository userRepository) {
        this.formMappingRepository = formMappingRepository;
        this.avniReportRepository = avniReportRepository;
        this.reportService = reportService;
        this.formRepository = formRepository;
        this.locationRepository = locationRepository;
        this.userGroupRepository = userGroupRepository;
        this.userRepository = userRepository;
    }

    @RequestMapping(value = "/report/aggregate/codedConcepts", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<JsonObject> getReportData(@RequestParam(value = "formMappingId", required = false) Long formMappingId,
                                          @RequestParam(value = "formUUID", required = false) String formUUID,
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

    @RequestMapping(value = "/report/aggregate/activity", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public JsonObject getRegistrationAggregate(@RequestParam(value = "type", required = false) String type,
                                               @RequestParam(value = "startDate", required = false) String startDate,
                                               @RequestParam(value = "endDate", required = false) String endDate,
                                               @RequestParam(value = "locationIds", required = false, defaultValue = "") List<Long> locationIds,
                                               @RequestParam(value = "subjectTypeIds", required = false, defaultValue = "") List<Long> subjectTypeIds,
                                               @RequestParam(value = "programIds", required = false, defaultValue = "") List<Long> programIds,
                                               @RequestParam(value = "encounterTypeIds", required = false, defaultValue = "") List<Long> encounterTypeIds) {
        List<Long> lowestLocationIds = getLocations(locationIds);
        switch (type){
            case "registrations" : return reportService.allRegistrations(startDate, endDate, subjectTypeIds, lowestLocationIds);
            case "enrolments": return reportService.allEnrolments(startDate, endDate, programIds, lowestLocationIds);
            case "completedVisits": return reportService.completedVisits(startDate, endDate, encounterTypeIds, lowestLocationIds);
            case "daywiseActivities": return reportService.dailyActivities(startDate, endDate, subjectTypeIds, programIds, encounterTypeIds, lowestLocationIds);
            case "cancelledVisits": return reportService.cancelledVisits(startDate, endDate, encounterTypeIds, lowestLocationIds);
            case "onTimeVisits": return reportService.onTimeVisits(startDate, endDate, encounterTypeIds, lowestLocationIds);
            case "programExits": return reportService.programExits(startDate, endDate, programIds, lowestLocationIds);
            default: return new JsonObject();
        }
    }

    @RequestMapping(value = "/report/hr/overallActivities", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<UserActivityResult> getUserWiseActivities(@RequestParam(value = "startDate", required = false) String startDate,
                                                          @RequestParam(value = "endDate", required = false) String endDate,
                                                          @RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds) {
        return avniReportRepository.generateUserActivityResults(
                reportService.getDateDynamicWhere(startDate, endDate, "registration_date"),
                reportService.getDateDynamicWhere(startDate, endDate, "encounter_date_time"),
                reportService.getDateDynamicWhere(startDate, endDate, "enrolment_date_time"),
                reportService.getDynamicUserWhere(userIds, "u.id")
        );
    }

    @RequestMapping(value = "/report/hr/syncFailures", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<UserActivityResult> getUserWiseSyncFailures(@RequestParam(value = "startDate", required = false) String startDate,
                                                            @RequestParam(value = "endDate", required = false) String endDate,
                                                            @RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds) {
        return avniReportRepository.generateUserSyncFailures(
                reportService.getDateDynamicWhere(startDate, endDate, "sync_start_time"),
                reportService.getDynamicUserWhere(userIds, "u.id")
        );
    }

    @RequestMapping(value = "/report/hr/deviceModels", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<AggregateReportResult> getUserWiseDeviceModels(@RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds) {
        return avniReportRepository.generateUserDeviceModels(reportService.getDynamicUserWhere(userIds, "u.id"));
    }

    @RequestMapping(value = "/report/hr/appVersions", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<AggregateReportResult> getUserWiseAppVersions(@RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds) {
        return avniReportRepository.generateUserAppVersions(reportService.getDynamicUserWhere(userIds, "u.id"));
    }

    @RequestMapping(value = "/report/hr/userDetails", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<UserActivityResult> getUserDetails(@RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds) {
        return avniReportRepository.generateUserDetails(reportService.getDynamicUserWhere(userIds, "u.id"));
    }

    @RequestMapping(value = "/report/hr/championUsers", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<AggregateReportResult> getChampionUsers(@RequestParam(value = "startDate", required = false) String startDate,
                                                        @RequestParam(value = "endDate", required = false) String endDate,
                                                        @RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds) {
        return avniReportRepository.generateCompletedVisitsOnTimeByProportion(
                ">= 0.8",
                reportService.getDateDynamicWhere(startDate, endDate, "encounter_date_time"),
                reportService.getDynamicUserWhere(userIds, "u.id")
        );
    }

    @RequestMapping(value = "/report/hr/nonPerformingUsers", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<AggregateReportResult> getNonPerformingUsers(@RequestParam(value = "startDate", required = false) String startDate,
                                                             @RequestParam(value = "endDate", required = false) String endDate,
                                                             @RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds) {
        return avniReportRepository.generateCompletedVisitsOnTimeByProportion(
                "<= 0.5",
                reportService.getDateDynamicWhere(startDate, endDate, "encounter_date_time"),
                reportService.getDynamicUserWhere(userIds, "u.id")
        );
    }

    @RequestMapping(value = "/report/hr/mostCancelled", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public List<AggregateReportResult> getUsersCancellingMostVisits(@RequestParam(value = "startDate", required = false) String startDate,
                                                                    @RequestParam(value = "endDate", required = false) String endDate,
                                                                    @RequestParam(value = "userIds", required = false, defaultValue = "") List<Long> userIds) {
        return avniReportRepository.generateUserCancellingMostVisits(
                reportService.getDateDynamicWhere(startDate, endDate, "encounter_date_time"),
                reportService.getDynamicUserWhere(userIds, "u.id"));
    }

    @RequestMapping(value = "/report/hr/commonUserIds", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public Set<Long> getCommonsUsersByLocationAndGroup(@RequestParam(value = "groupId", required = false) Long groupId,
                                                       @RequestParam(value = "locationIds", required = false, defaultValue = "") List<Long> locationIds) {
        if (groupId == null && locationIds.isEmpty()) {
            return new HashSet<>();
        } else if (groupId != null && !locationIds.isEmpty()) {
            Set<Long> groupUserIds = userGroupRepository.findByGroup_IdAndIsVoidedFalse(groupId)
                    .stream()
                    .map(UserGroup::getUser)
                    .map(User::getId)
                    .collect(Collectors.toSet());
            List<Long> catchmentIds = locationRepository.getVirtualCatchmentsForAddressLevelIds(locationIds)
                    .stream()
                    .map(VirtualCatchmentProjection::getCatchment_id)
                    .collect(Collectors.toList());
            return userRepository.findByCatchment_IdInAndIsVoidedFalse(catchmentIds)
                    .stream()
                    .map(User::getId)
                    .filter(groupUserIds::contains)
                    .collect(Collectors.toSet());
        } else if (!locationIds.isEmpty()) {
            List<Long> catchmentIds = locationRepository.getVirtualCatchmentsForAddressLevelIds(locationIds)
                    .stream()
                    .map(VirtualCatchmentProjection::getCatchment_id).collect(Collectors.toList());
            return userRepository.findByCatchment_IdInAndIsVoidedFalse(catchmentIds)
                    .stream()
                    .map(User::getId).collect(Collectors.toSet());
        } else {
            return userGroupRepository.findByGroup_IdAndIsVoidedFalse(groupId)
                    .stream()
                    .map(UserGroup::getUser)
                    .map(User::getId)
                    .collect(Collectors.toSet());
        }
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
