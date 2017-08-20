package org.openchs.domain;

import org.junit.Test;

import static org.junit.Assert.*;

public class CHSEntityTest {
    @Test
    public void isNew() throws Exception {
        assertEquals(true, new CHSEntity().isNew());

        CHSEntity chsEntity = new CHSEntity();
        chsEntity.setId(1l);
        assertEquals(false, chsEntity.isNew());

        chsEntity = new CHSEntity();
        chsEntity.setId(0l);
        assertEquals(true, chsEntity.isNew());
    }
}