package org.avni.server.web.request.webapp;

import org.avni.server.domain.Catchment;
import org.avni.server.web.request.ReferenceDataContract;

import java.util.List;
import java.util.stream.Collectors;

public class CatchmentExport {
    private String name;
    private String uuid;
    private List<ReferenceDataContract> locations;
    private boolean voided;

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
        catchmentExport.setVoided(catchment.isVoided());
        catchmentExport.setLocations(catchment.getAddressLevels()
                .stream()
                .map(addressLevel -> new ReferenceDataContract(addressLevel.getUuid()))
                .collect(Collectors.toList())
        );
        return catchmentExport;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }
}
