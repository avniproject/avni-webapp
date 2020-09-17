package org.openchs.web;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openchs.dao.CatchmentRepository;
import org.openchs.domain.Catchment;
import org.openchs.web.request.CatchmentContract;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Map;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class CatchmentControllerUnitTest {
    @Mock
    private CatchmentRepository catchmentRepository;
    private CatchmentController catchmentController;

    @Before
    public void setup() {
        initMocks(this);
        catchmentController = new CatchmentController(catchmentRepository, null, null, null);
    }

    @Test()
    public void shouldReturnErrorWhenOnUpdateThereAlreadyExistsACatchmentWithSameName() throws Exception {
        Catchment foo = new Catchment();
        foo.setId(1L);
        foo.setName("foo");
        Catchment bar = new Catchment();
        bar.setId(2L);
        bar.setName("bar");
        when(catchmentRepository.findOne(1L)).thenReturn(foo);
        when(catchmentRepository.findByName("bar")).thenReturn(bar);

        CatchmentContract updateCatchment = new CatchmentContract();
        updateCatchment.setId(1L);
        updateCatchment.setName("bar");

        ResponseEntity responseEntity = catchmentController.updateCatchment(1L, updateCatchment);
        assertThat(responseEntity.getStatusCodeValue(), is(equalTo(400)));
        Map body = (Map) responseEntity.getBody();
        assertThat(body.get("message"), is(equalTo("Catchment with name bar already exists")));
    }

    @Test()
    public void shouldAllowToChangeCatchmentNameWhenThereIsNoConflict() throws Exception {
        Catchment foo = new Catchment();
        foo.setId(1L);
        foo.setName("foo");
        Catchment bar = new Catchment();
        bar.setId(2L);
        bar.setName("bar");
        when(catchmentRepository.findOne(1L)).thenReturn(foo);
        when(catchmentRepository.findByName("foo")).thenReturn(foo);
        when(catchmentRepository.findByName("bar")).thenReturn(bar);
        when(catchmentRepository.findByName("tada")).thenReturn(null);


        CatchmentContract updateCatchment = new CatchmentContract();
        updateCatchment.setId(1L);
        updateCatchment.setName("tada");
        updateCatchment.setLocationIds(new ArrayList<>());

        ResponseEntity responseEntity = catchmentController.updateCatchment(1L, updateCatchment);
        assertThat(responseEntity.getStatusCodeValue(), is(equalTo(200)));
    }

    @Test()
    public void shouldReturnErrorWhenOnCreateThereAlreadyExistsACatchmentWithSameName() throws Exception {
        Catchment foo = new Catchment();
        foo.setId(1L);
        foo.setName("foo");
        when(catchmentRepository.findByName("foo")).thenReturn(foo);

        CatchmentContract createCatchment = new CatchmentContract();
        createCatchment.setId(2L);
        createCatchment.setName("foo");

        ResponseEntity responseEntity = catchmentController.createSingleCatchment(createCatchment);
        assertThat(responseEntity.getStatusCodeValue(), is(equalTo(400)));
        Map body = (Map) responseEntity.getBody();
        assertThat(body.get("message"), is(equalTo("Catchment with name foo already exists")));
    }
}
