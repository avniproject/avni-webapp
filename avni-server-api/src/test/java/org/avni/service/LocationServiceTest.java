package org.avni.service;

import org.avni.dao.AddressLevelTypeRepository;
import org.avni.dao.LocationMappingRepository;
import org.avni.dao.LocationRepository;
import org.avni.dao.OrganisationRepository;
import org.avni.web.request.webapp.search.LocationSearchRequest;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.springframework.data.domain.Pageable;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.MockitoAnnotations.initMocks;

public class LocationServiceTest {

    @Mock
    private LocationMappingRepository locationMappingRepository;
    @Mock
    private OrganisationRepository organisationRepository;
    @Mock
    private AddressLevelTypeRepository addressLevelTypeRepository;
    @Mock
    private LocationRepository locationRepository;

    private LocationService locationService;

    @Before
    public void before() {
        initMocks(this);
        locationService = new LocationService(locationRepository, addressLevelTypeRepository, organisationRepository, locationMappingRepository);
    }

    @Test
    public void shouldSearchByIdAloneIfAddressLevelAndParentNotAvailable() {
        String searchString = "mum";
        LocationSearchRequest searchRequest = new LocationSearchRequest(searchString, null, null, mock(Pageable.class));
        locationService.find(searchRequest);

        verify(locationRepository).findLocationProjectionByTitleIgnoreCase(eq(searchString), any(Pageable.class));
    }

    @Test
    public void shouldSearchByAddressLevelTypeIfAvailable() {
        String searchString = "mum";
        int addressLevelTypeId = 12;
        LocationSearchRequest searchRequest = new LocationSearchRequest(searchString, addressLevelTypeId, null, mock(Pageable.class));
        locationService.find(searchRequest);

        verify(locationRepository).findLocationProjectionByTitleIgnoreCaseAndTypeId(matches(searchString), eq(addressLevelTypeId), any(Pageable.class));
    }

    @Test
    public void shouldSearchByAddressLevelTypeAndParentIfAvailable() {
        String searchString = "mum";
        int addressLevelTypeId = 12;
        Integer parentId = 123;
        LocationSearchRequest searchRequest = new LocationSearchRequest(searchString, addressLevelTypeId, parentId, mock(Pageable.class));
        locationService.find(searchRequest);

        verify(locationRepository).findLocationProjectionByTitleIgnoreCaseAndTypeIdAndParentId(eq(searchString), eq(addressLevelTypeId), eq(parentId), any(Pageable.class));
    }
}