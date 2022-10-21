package org.avni.server.importer.batch.csv.writer;

import org.avni.server.dao.AddressLevelTypeRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.AddressLevelType;
import org.avni.server.domain.factory.AddressLevelBuilder;
import org.avni.server.domain.factory.AddressLevelTypeBuilder;
import org.avni.server.importer.batch.csv.creator.ObservationCreator;
import org.avni.server.importer.batch.model.Row;
import org.avni.server.service.LocationService;
import org.avni.server.web.request.LocationContract;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

public class LocationWriterTest {
    private AddressLevelTypeRepository addressLevelTypeRepository;
    private LocationRepository locationRepository;
    private LocationService locationService;
    private LocationWriter locationWriter;

    @Before
    public void setup() {
        addressLevelTypeRepository = mock(AddressLevelTypeRepository.class);
        locationRepository = mock(LocationRepository.class);
        locationService = mock(LocationService.class);

        locationWriter = new LocationWriter(locationService, locationRepository, addressLevelTypeRepository, mock(ObservationCreator.class));
        when(locationService.save(any())).thenReturn(new AddressLevel());
    }

    @Test
    public void processSameLocationAcrossDifferentHierarchy() {
        createHierarchyOneOfLocationTypes();
        createHierarchyTwoOfLocationTypes();
//        importLocationsForHierarchyOne();
    }

    private List<AddressLevelType> createHierarchyOneOfLocationTypes() {
        return Arrays.asList(blockType(),
                new AddressLevelTypeBuilder().name("Village").level(2.0).build());
    }

    private AddressLevelType blockType() {
        return new AddressLevelTypeBuilder().name("Block").level(3.0).build();
    }

    private List<AddressLevelType> createHierarchyTwoOfLocationTypes() {
        return Arrays.asList(new AddressLevelTypeBuilder().name("Sub Center").level(3.0).build(),
                new AddressLevelTypeBuilder().name("AWC").level(2.0).build());
    }

    @Test
    public void updateExistingLocation_Strict() throws Exception {
        List<AddressLevelType> addressLevelTypes = createHierarchyOneOfLocationTypes();
        AddressLevel existingAddressLevel = new AddressLevelBuilder().
                                                id(1).title("Old Block Name").type(blockType()).build();

        when(addressLevelTypeRepository.findAllByIsVoidedFalse()).thenReturn(addressLevelTypes);
        when(locationRepository.findByLegacyIdOrUuid("1")).thenReturn(existingAddressLevel);

        locationWriter.setLocationUploadMode("strict");
        locationWriter.init();

        updateAddressLevel("ID", existingAddressLevel);
        updateAddressLevel("id", existingAddressLevel);
        updateAddressLevel("Id", existingAddressLevel);
    }

    public void updateAddressLevel(String idFieldHeaderName, AddressLevel addressLevel) throws Exception {
        ArrayList<Row> rows = new ArrayList<>();
        rows.add(new Row(new String[]{idFieldHeaderName, "Block"}, new String[]{"1", "Block Name"}));
        locationWriter.write(rows);
        assertEquals("Block Name", addressLevel.getTitle());
    }
}
