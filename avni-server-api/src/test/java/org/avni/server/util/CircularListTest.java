package org.avni.server.util;

import org.junit.Test;

import java.util.Arrays;
import java.util.Iterator;

import static org.assertj.core.api.Assertions.assertThat;

public class CircularListTest {

    @Test
    public void shouldKeepGoingOnAndOn() {
        CircularList<Integer> list = new CircularList<>(Arrays.asList(1, 2));
        Iterator<Integer> iterator = list.iterator();
        assertThat(iterator.next()).isEqualTo(1);
        assertThat(iterator.next()).isEqualTo(2);
        assertThat(iterator.next()).isEqualTo(1);
        assertThat(iterator.next()).isEqualTo(2);
    }
}