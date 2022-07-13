package org.avni.service;

import org.avni.dao.IndividualRepository;
import org.avni.dao.ResetSyncRepository;
import org.avni.dao.UserRepository;
import org.avni.domain.*;
import org.avni.web.request.CatchmentContract;
import org.avni.web.request.UserContract;
import org.avni.web.request.webapp.SubjectTypeContractWeb;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResetSyncService {
    private final ResetSyncRepository resetSyncRepository;
    private final UserRepository userRepository;
    private final IndividualRepository individualRepository;
    private final FormMappingService formMappingService;

    @Autowired
    public ResetSyncService(ResetSyncRepository resetSyncRepository, UserRepository userRepository, IndividualRepository individualRepository, FormMappingService formMappingService) {
        this.resetSyncRepository = resetSyncRepository;
        this.userRepository = userRepository;
        this.individualRepository = individualRepository;
        this.formMappingService = formMappingService;
    }

    public void recordCatchmentChange(Catchment savedCatchment, CatchmentContract request) {
        List<User> usersAssignedThisCatchment = userRepository.findByCatchmentAndIsVoidedFalse(savedCatchment);
        List<Long> savedLocationIds = savedCatchment.getAddressLevels().stream().map(AddressLevel::getId).collect(Collectors.toList());
        if (!usersAssignedThisCatchment.isEmpty() &&
                isCatchmentChanged(savedLocationIds, request.getLocationIds()) &&
                hasSubjectsInNewLocation(savedLocationIds, request.getLocationIds())) {
            List<ResetSync> resetSyncList = usersAssignedThisCatchment.stream().map(user -> {
                ResetSync resetSync = buildNewResetSync();
                resetSync.setUser(user);
                return resetSync;
            }).collect(Collectors.toList());
            resetSyncRepository.saveAll(resetSyncList);
        }
    }

    public void recordSyncAttributeChange(SubjectType savedSubjectType, SubjectTypeContractWeb request) {
        if (individualRepository.existsBySubjectType(savedSubjectType) &&
                anySyncAttributeChanged(savedSubjectType, request)) {
            ResetSync resetSync = buildNewResetSync();
            resetSync.setSubjectType(savedSubjectType);
            resetSyncRepository.save(resetSync);
        }
    }

    private boolean anySyncAttributeChanged(SubjectType savedSubjectType, SubjectTypeContractWeb request) {
        return isChanged(savedSubjectType.getSyncRegistrationConcept1(), request.getSyncRegistrationConcept1()) ||
                isChanged(savedSubjectType.getSyncRegistrationConcept2(), request.getSyncRegistrationConcept2()) ||
                isChanged(savedSubjectType.isShouldSyncByLocation(), request.isShouldSyncByLocation());
    }

    public void recordSyncAttributeValueChangeForUser(User savedUser, UserContract userContract) {
        JsonObject newSyncSettings = userContract.getSyncSettings() == null ? new JsonObject() : userContract.getSyncSettings();
        Long savedCatchmentId = savedUser.getCatchmentId().orElse(null);
        if (isSyncSettingsChanged(savedUser.getSyncSettings(), newSyncSettings) || isChanged(savedCatchmentId, userContract.getCatchmentId())) {
            Set<SubjectType> changedSubjectTypes = getChangedSubjectTypes(savedUser.getSyncSettings(), newSyncSettings);
            if (changedSubjectTypes.isEmpty()) {
                ResetSync resetSync = buildNewResetSync();
                resetSync.setUser(savedUser);
                resetSyncRepository.save(resetSync);
            } else {
                changedSubjectTypes.forEach(st -> {
                    ResetSync resetSync = buildNewResetSync();
                    resetSync.setUser(savedUser);
                    resetSync.setSubjectType(st);
                    resetSyncRepository.save(resetSync);
                });
            }
        }
    }

    private Set<SubjectType> getChangedSubjectTypes(JsonObject olderSettings, JsonObject newSettings) {
        Set<SubjectType> changedSubjectTypes = new HashSet<>();
        if (isSyncConcept1Changed(olderSettings, newSettings)) {
            String conceptUUID = (String) newSettings.getOrDefault(User.SyncSettingKeys.syncConcept1.name(), olderSettings.getOrDefault(User.SyncSettingKeys.syncConcept1.name(), null));
            Set<SubjectType> allSubjectTypes = formMappingService.getAllSubjectTypesHavingConceptUUID(conceptUUID);
            changedSubjectTypes.addAll(allSubjectTypes);
        }
        if (isSyncConcept2Changed(olderSettings, newSettings)) {
            String conceptUUID = (String) newSettings.getOrDefault(User.SyncSettingKeys.syncConcept2.name(), olderSettings.getOrDefault(User.SyncSettingKeys.syncConcept2.name(), null));
            Set<SubjectType> allSubjectTypes = formMappingService.getAllSubjectTypesHavingConceptUUID(conceptUUID);
            changedSubjectTypes.addAll(allSubjectTypes);
        }
        return changedSubjectTypes;
    }

    private boolean isSyncConcept1Changed(JsonObject olderSettings, JsonObject newSettings) {
        return isChanged(olderSettings.getOrDefault(User.SyncSettingKeys.syncConcept1.name(), null), newSettings.getOrDefault(User.SyncSettingKeys.syncConcept1.name(), null)) ||
                isConceptValueChanged(olderSettings.getOrDefault(User.SyncSettingKeys.syncConcept1Values.name(), Collections.EMPTY_LIST), newSettings.getOrDefault(User.SyncSettingKeys.syncConcept1Values.name(), Collections.EMPTY_LIST));
    }

    private boolean isSyncConcept2Changed(JsonObject olderSettings, JsonObject newSettings) {
        return isChanged(olderSettings.getOrDefault(User.SyncSettingKeys.syncConcept2.name(), null), newSettings.getOrDefault(User.SyncSettingKeys.syncConcept2.name(), null)) ||
                isConceptValueChanged(olderSettings.getOrDefault(User.SyncSettingKeys.syncConcept2Values.name(), Collections.EMPTY_LIST), newSettings.getOrDefault(User.SyncSettingKeys.syncConcept2Values.name(), Collections.EMPTY_LIST));
    }

    private boolean isSyncSettingsChanged(JsonObject olderSettings, JsonObject newSettings) {
        return isSyncConcept1Changed(olderSettings, newSettings) || isSyncConcept2Changed(olderSettings, newSettings);
    }

    private boolean isCatchmentChanged(List<Long> savedLocationIds, List<Long> locationIdsPassedInRequest) {
        return !(savedLocationIds.containsAll(locationIdsPassedInRequest) && locationIdsPassedInRequest.containsAll(savedLocationIds));
    }

    private boolean hasSubjectsInNewLocation(List<Long> savedLocationIds, List<Long> locationIdsPassedInRequest) {
        List<Long> newlyAddedIds = new ArrayList<>(locationIdsPassedInRequest);
        newlyAddedIds.removeAll(savedLocationIds);
        List<Long> removedIds = new ArrayList<>(savedLocationIds);
        removedIds.removeAll(locationIdsPassedInRequest);
        return individualRepository.hasSubjectsInLocations(newlyAddedIds) ||
                individualRepository.hasSubjectsInLocations(removedIds);
    }

    private ResetSync buildNewResetSync() {
        ResetSync resetSync = new ResetSync();
        resetSync.assignUUID();
        return resetSync;
    }

    private boolean isConceptValueChanged(Object syncValue1, Object syncValue2) {
        List<String> syncValue1List = (List<String>) syncValue1;
        List<String> syncValue2List = (List<String>) syncValue2;
        return !(syncValue1List.containsAll(syncValue2List) && syncValue2List.containsAll(syncValue1List));
    }

    private boolean isChanged(Object str1, Object str2) {
        return !Objects.equals(str1, str2);
    }

    public Page<ResetSync> getByLastModifiedForUser(DateTime lastModifiedDateTime, DateTime now, User user, Pageable pageable) {
        return resetSyncRepository.findAllByUserIsNullOrUserAndLastModifiedDateTimeBetweenOrderByLastModifiedDateTimeAscIdAsc(user, lastModifiedDateTime.toDate(), now.toDate(), pageable);
    }
}
