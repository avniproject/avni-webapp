package org.avni.server.application;

public enum ValueType {
    Single, Multi, yes;

    public static ValueType[] getSelectValueTypes() {
        return new ValueType[]{ValueType.Single, ValueType.Multi};
    }
}
