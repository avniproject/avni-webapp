package org.avni.server.service;

import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.ResetSyncRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.domain.*;
import org.avni.server.util.JsonObjectUtil;
import org.avni.server.web.request.CatchmentContract;
import org.avni.server.web.request.UserContract;
import org.avni.server.web.request.syncAttribute.UserSyncSettings;
import org.avni.server.web.request.webapp.SubjectTypeContractWeb;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ResetSyncService {
    private final ResetSyncRepository resetSyncRepository;
    private final UserRepository userRepository;
    private final IndividualRepository individualRepository;
    private final SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public ResetSyncService(ResetSyncRepository resetSyncRepository, UserRepository userRepository, IndividualRepository individualRepository, SubjectTypeRepository subjectTypeRepository) {
        this.resetSyncRepository = resetSyncRepository;
        this.userRepository = userRepository;
        this.individualRepository = individualRepository;
        this.subjectTypeRepository = subjectTypeRepository;
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
        if (individualRepository.existsBySubjectTypeUuid(savedSubjectType.getUuid()) &&
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

    public void recordSyncAttributeValueChangeForUser(User savedUser, UserContract userContract, JsonObject newSyncSettings) {
        Long savedCatchmentId = savedUser.getCatchmentId().orElse(null);
        if (isChanged(savedCatchmentId, userContract.getCatchmentId())) {
            ResetSync resetSync = buildNewResetSync();
            resetSync.setUser(savedUser);
            resetSyncRepository.save(resetSync);
        } else {
            List<SubjectType> changedSubjectTypes = getChangedSubjectTypes(savedUser.getSyncSettings(), newSyncSettings);
            changedSubjectTypes.forEach(st -> {
                ResetSync resetSync = buildNewResetSync();
                resetSync.setUser(savedUser);
                resetSync.setSubjectType(st);
                resetSyncRepository.save(resetSync);
            });
        }
    }

    private List<SubjectType> getChangedSubjectTypes(JsonObject olderSettings, JsonObject newSettings) {
        List<UserSyncSettings> oldUserSettings = JsonObjectUtil.getUserSyncSettings(olderSettings);
        List<UserSyncSettings> newUserSettings = JsonObjectUtil.getUserSyncSettings(newSettings);
        List<String> changedSubjectTypeUUIDs = newUserSettings.stream().filter(nus -> {
            UserSyncSettings savedUserSyncSetting = oldUserSettings.stream().filter(ous -> nus.getSubjectTypeUUID().equals(ous.getSubjectTypeUUID())).findFirst().orElse(null);
            return savedUserSyncSetting == null || isSyncConcept1Changed(savedUserSyncSetting, nus) || isSyncConcept2Changed(savedUserSyncSetting, nus);
        })
                .map(UserSyncSettings::getSubjectTypeUUID)
                .filter(individualRepository::existsBySubjectTypeUuid)
                .collect(Collectors.toList());
        return subjectTypeRepository.findAllByUuidIn(changedSubjectTypeUUIDs);
    }

    private boolean isSyncConcept1Changed(UserSyncSettings olderSettings, UserSyncSettings newSettings) {
        return isChanged(olderSettings.getSyncConcept1(), newSettings.getSyncConcept1()) ||
                isConceptValueChanged(olderSettings.getSyncConcept1Values(), newSettings.getSyncConcept1Values());
    }

    private boolean isSyncConcept2Changed(UserSyncSettings olderSettings, UserSyncSettings newSettings) {
        return isChanged(olderSettings.getSyncConcept2(), newSettings.getSyncConcept2()) ||
                isConceptValueChanged(olderSettings.getSyncConcept2Values(), newSettings.getSyncConcept2Values());
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

    private boolean isConceptValueChanged(List<String> syncValue1List, List<String> syncValue2List) {
        return !(syncValue1List.containsAll(syncValue2List) && syncValue2List.containsAll(syncValue1List));
    }

    private boolean isChanged(Object str1, Object str2) {
        return !Objects.equals(str1, str2);
    }

    public Page<ResetSync> getByLastModifiedForUser(DateTime lastModifiedDateTime, DateTime now, User user, Pageable pageable) {
        return resetSyncRepository.findAllByUserIsNullOrUserAndLastModifiedDateTimeBetweenOrderByLastModifiedDateTimeAscIdAsc(user, lastModifiedDateTime.toDate(), now.toDate(), pageable);
    }
}
