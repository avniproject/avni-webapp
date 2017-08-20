package org.openchs.excel;

import org.junit.Assert;
import org.junit.Test;

public class ContentTypeSequenceTest {
    @Test
    public void getNextType() throws Exception {
        ContentTypeSequence contentTypeSequence = new ContentTypeSequence();
        Assert.assertEquals(ContentType.RegistrationHeader, contentTypeSequence.getNextType(null, "foo"));
        Assert.assertEquals(ContentType.Registration, contentTypeSequence.getNextType(ContentType.RegistrationHeader, "foo"));
        Assert.assertEquals(ContentType.Registration, contentTypeSequence.getNextType(ContentType.Registration, "foo"));
        Assert.assertEquals(ContentType.None, contentTypeSequence.getNextType(ContentType.Registration, ""));
        Assert.assertEquals(ContentType.None, contentTypeSequence.getNextType(ContentType.None, ""));
        Assert.assertEquals(ContentType.EnrolmentHeader, contentTypeSequence.getNextType(ContentType.None, "bar"));
        Assert.assertEquals(ContentType.Enrolment, contentTypeSequence.getNextType(ContentType.EnrolmentHeader, "bar"));
        Assert.assertEquals(ContentType.Enrolment, contentTypeSequence.getNextType(ContentType.Enrolment, "bar"));
        Assert.assertEquals(ContentType.None, contentTypeSequence.getNextType(ContentType.Enrolment, ""));
        Assert.assertEquals(ContentType.None, contentTypeSequence.getNextType(ContentType.None, ""));
        Assert.assertEquals(ContentType.ProgramEncounterHeader, contentTypeSequence.getNextType(ContentType.None, "baz"));
        Assert.assertEquals(ContentType.ProgramEncounter, contentTypeSequence.getNextType(ContentType.ProgramEncounterHeader, "baz"));
        Assert.assertEquals(ContentType.ProgramEncounter, contentTypeSequence.getNextType(ContentType.ProgramEncounter, "baz"));
    }
}