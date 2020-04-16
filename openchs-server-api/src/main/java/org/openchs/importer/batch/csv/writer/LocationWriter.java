package org.openchs.importer.batch.csv.writer;

import org.openchs.builder.BuilderException;
import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.importer.batch.model.Row;
import org.openchs.service.LocationService;
import org.openchs.web.request.LocationContract;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LocationWriter implements ItemWriter<Row> {

    private LocationService locationService;
    private LocationRepository locationRepository;

    @Autowired
    public LocationWriter(LocationService locationService, LocationRepository locationRepository) {
        this.locationService = locationService;
        this.locationRepository = locationRepository;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws BuilderException {
        AddressLevel parent = null;
        for (String header : row.getHeaders()) {
            AddressLevel location = locationRepository.findByParentAndTitleIgnoreCase(parent, row.get(header));
            if (location == null) {
                LocationContract locationContract = new LocationContract();
                locationContract.setupUuidIfNeeded();
                locationContract.setName(row.get(header));
                locationContract.setType(header);
                locationContract.setLevel(parent == null ? row.getHeaders().length : parent.getLevel() - 1);
                if (parent != null) {
                    locationContract.setParent(new LocationContract(parent.getUuid()));
                }
                location = locationService.save(locationContract);
            }
            parent = location;
        }
    }
}
