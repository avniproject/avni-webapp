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
        Assert.assertEquals(ContentType.NotRegistration, contentTypeSequence.getNextType(ContentType.Registration, ""));

        Assert.assertEquals(ContentType.EnrolmentHeader, contentTypeSequence.getNextType(ContentType.NotRegistration, "foo"));
        Assert.assertEquals(ContentType.Enrolment, contentTypeSequence.getNextType(ContentType.EnrolmentHeader, "bar"));
        Assert.assertEquals(ContentType.Enrolment, contentTypeSequence.getNextType(ContentType.Enrolment, "bar"));
        Assert.assertEquals(ContentType.NotEnrolment, contentTypeSequence.getNextType(ContentType.Enrolment, ""));

        Assert.assertEquals(ContentType.ProgramEncounterHeader, contentTypeSequence.getNextType(ContentType.NotEnrolment, "baz"));
        Assert.assertEquals(ContentType.ProgramEncounter, contentTypeSequence.getNextType(ContentType.ProgramEncounterHeader, "baz"));
        Assert.assertEquals(ContentType.NotProgramEncounter, contentTypeSequence.getNextType(ContentType.ProgramEncounterHeader, ""));
        Assert.assertEquals(ContentType.ProgramEncounter, contentTypeSequence.getNextType(ContentType.ProgramEncounter, "baz"));
        Assert.assertEquals(ContentType.NotProgramEncounter, contentTypeSequence.getNextType(ContentType.ProgramEncounter, null));
    }
}