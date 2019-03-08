package org.openchs.domain;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class UserSettingsCollection extends HashMap<String, Object> implements Serializable {
    public UserSettingsCollection() {
    }

    public UserSettingsCollection(Map<String, Object> userSettings) {
        this.putAll(userSettings);
    }
}