package org.avni.application;

public enum ValueType {
    Single, Multi;

    public static ValueType[] getSelectValueTypes() {
        return new ValueType[]{ValueType.Single, ValueType.Multi};
    }
}
