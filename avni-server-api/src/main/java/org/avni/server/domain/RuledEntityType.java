package org.avni.server.domain;

import org.springframework.util.StringUtils;

public enum RuledEntityType {
    Form, Program, EncounterType, None;

    public static RuledEntityType parse(String entityType) {
        return entityType != null ? RuledEntityType.valueOf(StringUtils.capitalize(entityType)) : null;
    }

    public static boolean isForm(RuledEntityType entityType) {
        return RuledEntityType.Form.equals(entityType);
    }

    public static boolean isProgram(RuledEntityType entityType) {
        return RuledEntityType.Program.equals(entityType);
    }

    public static boolean isNone(RuledEntityType entityType) {
        return RuledEntityType.None.equals(entityType);
    }
}
