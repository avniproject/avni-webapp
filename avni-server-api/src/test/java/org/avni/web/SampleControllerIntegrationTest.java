package org.avni.web;

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.jdbc.Sql;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

@Sql({"/test-data-openchs-organisation.sql"})
public class SampleControllerIntegrationTest extends AbstractControllerIntegrationTest {

    @Before
    public void setUp() throws Exception {
        super.setUp();
    }

    @Test
    public void getHello() throws Exception {
        ResponseEntity<String> response = template.getForEntity(base.toString() + "/hello",
                String.class);
        assertThat(response.getBody(), equalTo("world"));
    }

    @Test
    public void getPing() throws Exception {
        ResponseEntity<String> response = template.getForEntity(base.toString() + "/ping",
                String.class);
        assertThat(response.getBody(), equalTo("pong"));
    }
}
