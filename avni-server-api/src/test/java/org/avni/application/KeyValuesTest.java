package org.avni.application;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class KeyValuesTest {
    @Test
    public void containsOneOf() {
        KeyValues keyValues = new KeyValues();
        keyValues.add(new KeyValue(KeyType.Select, ValueType.Multi.toString()));
        assertEquals(true, keyValues.containsOneOfTheValues(KeyType.Select, ValueType.getSelectValueTypes()));
    }
}
