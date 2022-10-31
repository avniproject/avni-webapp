package org.avni.server.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.User.SyncSettingKeys;
import org.avni.server.web.request.syncAttribute.UserSyncSettings;

import java.util.Collections;
import java.util.List;

public class JsonObjectUtil {

    public static List<String> getSyncAttributeValuesBySubjectTypeUUID(JsonObject syncSettings, String subjectTypeUUID, SyncSettingKeys syncAttribute) {
        List<UserSyncSettings> userSyncSettings =getUserSyncSettings(syncSettings);
        UserSyncSettings subjectTypeSyncSettings = userSyncSettings.stream().filter(userSyncSetting -> subjectTypeUUID.equals(userSyncSetting.getSubjectTypeUUID())).findFirst().orElse(null);
        if (subjectTypeSyncSettings != null) {
            switch (syncAttribute) {
                case syncAttribute1:
                    return subjectTypeSyncSettings.getSyncConcept1Values();
                case syncAttribute2:
                    return subjectTypeSyncSettings.getSyncConcept2Values();
                default:
                    return Collections.emptyList();
            }
        }
        return Collections.emptyList();
    }

    public static List<UserSyncSettings> getUserSyncSettings(JsonObject syncSettings) {
        if (syncSettings.containsKey(SyncSettingKeys.subjectTypeSyncSettings.name())) {
            ObjectMapper objectMapper = ObjectMapperSingleton.getObjectMapper();
            return objectMapper.convertValue(syncSettings.get(SyncSettingKeys.subjectTypeSyncSettings.name()), new TypeReference<List<UserSyncSettings>>() {});
        }
        return Collections.emptyList();
    }
}
