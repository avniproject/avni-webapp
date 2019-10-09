package org.openchs.web.request.webapp;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openchs.domain.Catchment;
import org.openchs.web.request.ReferenceDataContract;

import java.util.List;
import java.util.stream.Collectors;

public class CatchmentExport {
    private String name;
    private String uuid;
    private String type;
    private List<ReferenceDataContract> locations;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<ReferenceDataContract> getLocations() {
        return locations;
    }

    public void setLocations(List<ReferenceDataContract> locations) {
        this.locations = locations;
    }

    public static CatchmentExport fromCatchment(Catchment catchment) {
        CatchmentExport catchmentExport = new CatchmentExport();
        catchmentExport.setUuid(catchment.getUuid());
        catchmentExport.setName(catchment.getName());
        catchmentExport.setType(catchment.getType());
        catchmentExport.setLocations(catchment.getAddressLevels()
                .stream()
                .map(addressLevel -> new ReferenceDataContract(addressLevel.getUuid()))
                .collect(Collectors.toList())
        );
        return catchmentExport;
    }
}