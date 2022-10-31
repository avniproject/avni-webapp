package org.avni.server.application;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;

public class KeyValues extends ArrayList<KeyValue> implements Serializable {
    public KeyValue get(KeyType keyType) {
        return this.stream().filter(keyValue -> keyValue.getKey().equals(keyType.toString())).findFirst().orElse(null);
    }

    public boolean containsKey(KeyType keyType) {
        return this.stream().anyMatch(x -> x.getKey().equals(keyType.toString()));
    }

    public KeyValue getKeyValue(KeyType keyType) {
        return this.stream().filter(keyValue -> keyValue.getKey().equals(keyType.toString())).findFirst().orElse(null);
    }

    public boolean containsOneOfTheValues(KeyType keyType, ValueType[] valueTypes) {
        KeyValue keyValue = getKeyValue(keyType);
        return keyValue != null && Arrays.stream(valueTypes).anyMatch(valueType -> valueType.toString().equals(keyValue.getValue().toString()));
    }
}
