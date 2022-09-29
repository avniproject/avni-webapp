package org.avni.web;

import org.avni.server.web.AddressLevelTypeController;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.avni.server.dao.AddressLevelTypeRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.AddressLevelType;
import org.avni.server.service.LocationService;
import org.avni.server.web.request.AddressLevelTypeContract;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class AddressLevelTypeControllerUnitTest {
    @Mock
    private AddressLevelTypeRepository addressLevelTypeRepository;
    @Mock
    private LocationService locationService;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private ProjectionFactory projectionFactory;

    private AddressLevelTypeController addressLevelTypeController;
    private static final String FOO_UUID = "e8fc567b-6301-4f90-9b5e-349d4d411553";
    private static final String BAR_UUID = "9f339e59-36fb-4533-8bee-fbb2a5a5cf98";

    @Before
    public void setup() {
        initMocks(this);
        addressLevelTypeController = new AddressLevelTypeController(addressLevelTypeRepository, locationRepository, locationService, projectionFactory);
        AddressLevelType foo = new AddressLevelType();
        foo.setUuid(FOO_UUID);
        foo.setName("foo");
        AddressLevelType bar = new AddressLevelType();
        bar.setId(2L);
        bar.setUuid(BAR_UUID);
        bar.setName("bar");
        when(addressLevelTypeRepository.findByUuid(FOO_UUID)).thenReturn(foo);
        when(addressLevelTypeRepository.findByUuid(BAR_UUID)).thenReturn(bar);
        when(addressLevelTypeRepository.findByName("foo")).thenReturn(foo);
        when(addressLevelTypeRepository.findByName("bar")).thenReturn(bar);
    }

    @Test()
    public void shouldReturnErrorWhenOnUpdateThereAlreadyExistsLocationTypeWithSameName() throws Exception {
        AddressLevelTypeContract updateAddressLevelType = new AddressLevelTypeContract();
        updateAddressLevelType.setUuid(FOO_UUID);
        updateAddressLevelType.setName("bar");

        ResponseEntity responseEntity = addressLevelTypeController.updateAddressLevelType(1L, updateAddressLevelType);
        assertThat(responseEntity.getStatusCodeValue(), is(equalTo(400)));
        Map body = (Map) responseEntity.getBody();
        assertThat(body.get("message"), is(equalTo("Location Type with name bar already exists")));
    }

    @Test()
    public void shouldUpdateWhenThereIsNoConflict() throws Exception {
        AddressLevelTypeContract updateAddressLevelType = new AddressLevelTypeContract();
        updateAddressLevelType.setUuid(FOO_UUID);
        updateAddressLevelType.setName("tada");

        ResponseEntity responseEntity = addressLevelTypeController.updateAddressLevelType(1L, updateAddressLevelType);
        assertThat(responseEntity.getStatusCodeValue(), is(equalTo(201)));
    }

    @Test()
    public void shouldReturnErrorWhenOnCreateThereAlreadyExistsLocationTypeWithSameName() throws Exception {
        AddressLevelTypeContract create = new AddressLevelTypeContract();
        create.setUuid(UUID.randomUUID().toString());
        create.setName("foo");

        ResponseEntity responseEntity = addressLevelTypeController.createAddressLevelType(create);
        assertThat(responseEntity.getStatusCodeValue(), is(equalTo(400)));
        Map body = (Map) responseEntity.getBody();
        assertThat(body.get("message"), is(equalTo("Location Type with name foo already exists")));
    }

    @Test()
    public void shouldCreateWhenThereIsNoConflict() throws Exception {
        AddressLevelTypeContract create = new AddressLevelTypeContract();
        create.setUuid(UUID.randomUUID().toString());
        create.setName("tada");

        ResponseEntity responseEntity = addressLevelTypeController.createAddressLevelType(create);
        assertThat(responseEntity.getStatusCodeValue(), is(equalTo(201)));
    }
}
