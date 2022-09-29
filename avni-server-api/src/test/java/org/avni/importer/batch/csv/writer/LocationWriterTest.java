package org.avni.importer.batch.csv.writer;

import org.avni.server.dao.AddressLevelTypeRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.AddressLevelType;
import org.avni.server.importer.batch.csv.creator.ObservationCreator;
import org.avni.server.importer.batch.csv.writer.LocationWriter;
import org.avni.server.importer.batch.model.Row;
import org.avni.server.service.LocationService;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;

import static org.mockito.Mockito.*;

public class LocationWriterTest {

    @Test
    public void shouldGetIdColumnNameFromHeaderCapsID() throws Exception {
        shouldGetIdColumnNameFromHeader("ID");
    }

    @Test
    public void shouldGetIdColumnNameFromHeaderSmallID() throws Exception {
        shouldGetIdColumnNameFromHeader("id");
    }

    @Test
    public void shouldGetIdColumnNameFromHeaderCamelID() throws Exception {
        shouldGetIdColumnNameFromHeader("Id");
    }

    public void shouldGetIdColumnNameFromHeader(String idString) throws Exception {
        LocationRepository locationRepository = mock(LocationRepository.class);
        AddressLevelTypeRepository addressLevelTypeRepository = mock(AddressLevelTypeRepository.class);
        AddressLevelType addressLevelType = new AddressLevelType();
        addressLevelType.setName("asdf");
        addressLevelType.setLevel(1D);
        when(addressLevelTypeRepository.findAllByIsVoidedFalse()).thenReturn(Arrays.asList(addressLevelType));
        LocationService locationService = mock(LocationService.class);
        when(locationService.save(any())).thenReturn(new AddressLevel());
        LocationWriter locationWriter = new LocationWriter(locationService, locationRepository, addressLevelTypeRepository, mock(ObservationCreator.class));
        locationWriter.init();
        locationWriter.setLocationUploadMode("strict");
        ArrayList<Row> rows = new ArrayList<>();
        rows.add(new Row(new String[]{idString, "asdf"}, new String[]{"1", "asdasdfasdf"}));
        locationWriter.write(rows);

        verify(locationRepository).findByLegacyIdOrUuid("1");
    }

}