package org.avni.server.framework.hibernate;

import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ArrayUserTypeTest {

    @Test
    public void shouldReturnEqualIfAndOnlyIfTheyAreEqual() {
        ArrayUserType arrayUserType = new ArrayUserType();
        assertThat(arrayUserType.equals(null, null)).as("Null should equal null").isTrue();
        assertThat(arrayUserType.equals(null, new String[]{})).as("Null test").isFalse();
        assertThat(arrayUserType.equals(new String[]{}, null)).as("Null test").isFalse();
        assertThat(arrayUserType.equals(new String[]{}, new String[]{})).as("Empty objects test").isTrue();
        assertThat(arrayUserType.equals(new String[]{"a", "b"}, new String[]{"a", "b"})).as("Equal in value").isTrue();
        assertThat(arrayUserType.equals(new String[]{"a", "b", "c"}, new String[]{"a", "b"})).as("Different length arrays").isFalse();
        assertThat(arrayUserType.equals(new String[]{"a", "b", "c"}, new String[]{"a", "c", "c"})).as("Different values").isFalse();
    }
}
