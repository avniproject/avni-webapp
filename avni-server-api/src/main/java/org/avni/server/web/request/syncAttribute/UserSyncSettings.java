package org.avni.server.web.request.syncAttribute;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.User;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.util.S;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

public class UserSyncSettings implements Serializable {
    private String subjectTypeUUID;
    private String syncConcept1;
    private List<String> syncConcept1Values;
    private String syncConcept2;
    private List<String> syncConcept2Values;

    public UserSyncSettings() {
    }

    public UserSyncSettings(String subjectTypeUUID, String syncConcept1, List<String> syncConcept1Values, String syncConcept2, List<String> syncConcept2Values) {
        this.subjectTypeUUID = subjectTypeUUID;
        if (syncConcept1 != null) {
            this.syncConcept1 = syncConcept1;
            this.syncConcept1Values = syncConcept1Values;
        }
        if (syncConcept2 != null) {
            this.syncConcept2 = syncConcept2;
            this.syncConcept2Values = syncConcept2Values;
        }
    }

    public static JsonObject fromUserSyncWebJSON(JsonObject subjectTypeSyncSettings, SubjectTypeRepository subjectTypeRepository) {
        if (subjectTypeSyncSettings == null) return new JsonObject();
        Set<String> subjectTypeNames = subjectTypeSyncSettings.keySet();
        List<UserSyncSettings> userSyncSettings = subjectTypeNames.stream().map(subjectTypeName -> {
            SubjectType subjectType = subjectTypeRepository.findByName(subjectTypeName);
            LinkedHashMap syncSettings = (LinkedHashMap) subjectTypeSyncSettings.get(subjectTypeName);
            return new UserSyncSettings(
                    subjectType.getUuid(),
                    isValidAttribute(syncSettings, User.SyncSettingKeys.syncAttribute1.name()) ? (String) syncSettings.get(User.SyncSettingKeys.syncAttribute1.name()) : null,
                    isValidAttribute(syncSettings, User.SyncSettingKeys.syncAttribute1.name()) ? (List<String>) syncSettings.get(User.SyncSettingKeys.syncAttribute1Values.name()) : Collections.emptyList(),
                    isValidAttribute(syncSettings, User.SyncSettingKeys.syncAttribute2.name()) ? (String) syncSettings.get(User.SyncSettingKeys.syncAttribute2.name()) : null,
                    isValidAttribute(syncSettings, User.SyncSettingKeys.syncAttribute2.name()) ? (List<String>) syncSettings.get(User.SyncSettingKeys.syncAttribute2Values.name()) : Collections.emptyList()
            );
        }).collect(Collectors.toList());
        return new JsonObject().with(User.SyncSettingKeys.subjectTypeSyncSettings.name(), userSyncSettings);
    }

    private static boolean isValidAttribute(LinkedHashMap syncSettings, String keyName) {
        return syncSettings.containsKey(keyName) && !S.isEmpty((String) syncSettings.get(keyName));
    }

    public static JsonObject fromUserSyncSettings(JsonObject syncSettings, SubjectTypeRepository subjectTypeRepository) {
        JsonObject response = new JsonObject();
        if (!syncSettings.containsKey(User.SyncSettingKeys.subjectTypeSyncSettings.name())) {
            return response;
        }
        ObjectMapper objectMapper = ObjectMapperSingleton.getObjectMapper();
        List<UserSyncSettings> userSyncSettings = objectMapper.convertValue(syncSettings.get(User.SyncSettingKeys.subjectTypeSyncSettings.name()), new TypeReference<List<UserSyncSettings>>() {});
        userSyncSettings.forEach(userSyncSetting -> {
            SubjectType subjectType = subjectTypeRepository.findByUuid(userSyncSetting.getSubjectTypeUUID());
            JsonObject subjectTypeSyncSettings = new JsonObject();
            if (userSyncSetting.getSyncConcept1() != null) {
                subjectTypeSyncSettings.with(User.SyncSettingKeys.syncAttribute1.name(), userSyncSetting.getSyncConcept1())
                        .with(User.SyncSettingKeys.syncAttribute1Values.name(), userSyncSetting.getSyncConcept1Values());
            }
            if (userSyncSetting.getSyncConcept2() != null) {
                subjectTypeSyncSettings.with(User.SyncSettingKeys.syncAttribute2.name(), userSyncSetting.getSyncConcept2())
                        .with(User.SyncSettingKeys.syncAttribute2Values.name(), userSyncSetting.getSyncConcept2Values());
            }
            response.with(subjectType.getName(), subjectTypeSyncSettings);
        });

        return response;
    }

    public String getSubjectTypeUUID() {
        return subjectTypeUUID;
    }

    public String getSyncConcept1() {
        return syncConcept1;
    }

    public List<String> getSyncConcept1Values() {
        return syncConcept1Values == null ? Collections.emptyList() : syncConcept1Values;
    }

    public String getSyncConcept2() {
        return syncConcept2;
    }

    public List<String> getSyncConcept2Values() {
        return syncConcept2Values == null ? Collections.emptyList() : syncConcept2Values;
    }

}
