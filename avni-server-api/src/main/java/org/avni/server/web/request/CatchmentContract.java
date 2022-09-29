package org.avni.server.web.request;

import org.avni.server.domain.Catchment;
import org.springframework.hateoas.core.Relation;

import org.joda.time.DateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Relation(collectionRelation = "catchment")
public class CatchmentContract extends ReferenceDataContract {
    private Long id;

    private List<Long> locationIds;

    private String createdBy;
    private String lastModifiedBy;
    private DateTime createdDateTime;
    private DateTime lastModifiedDateTime;
    private boolean fastSyncExists;
    private boolean deleteFastSync;

    private List<AddressLevelContract> locations = new ArrayList<>();

    public List<AddressLevelContract> getLocations() {
        return locations;
    }

    public void setLocations(List<AddressLevelContract> locations) {
        this.locations = locations;
    }

    public static CatchmentContract fromEntity(Catchment catchment) {
        CatchmentContract catchmentContract = new CatchmentContract();
        catchmentContract.setId(catchment.getId());
        catchmentContract.setUuid(catchment.getUuid());
        catchmentContract.setName(catchment.getName());
        catchmentContract.setVoided(catchment.isVoided());
        catchmentContract.setLocationIds(catchment.getAddressLevels().stream().map(addressLevel -> addressLevel.getId()).collect(Collectors.toList()));
        catchmentContract.setCreatedBy(catchment.getCreatedBy().getUsername());
        catchmentContract.setLastModifiedBy(catchment.getLastModifiedBy().getUsername());
        catchmentContract.setCreatedDateTime(catchment.getCreatedDateTime());
        catchmentContract.setModifiedDateTime(catchment.getLastModifiedDateTime());
        return catchmentContract;
    }

    @Override
    public String toString() {
        return String.format("UUID: %s, Name: %s", this.getUuid(), this.getName());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Long> getLocationIds() {
        return locationIds;
    }



    public void setLocationIds(List<Long> locationIds) {
        this.locationIds = locationIds;
    }
    public void setCreatedBy(String username){
        this.createdBy = username;
    }
    public String getCreatedBy(){
        return createdBy;
    }

    public void setLastModifiedBy(String username){
        this.lastModifiedBy = username;
    }

    public String getLastModifiedBy(){
        return lastModifiedBy;
    }


    public void setCreatedDateTime(DateTime createDateTime){
        this.createdDateTime = createDateTime;
    }

    public DateTime getCreatedDateTime(){
        return createdDateTime;
    }

    public void setModifiedDateTime(DateTime lastModifiedDateTime){
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public DateTime getModifiedDateTime(){
        return lastModifiedDateTime;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public boolean isFastSyncExists() {
        return fastSyncExists;
    }

    public void setFastSyncExists(boolean fastSyncExists) {
        this.fastSyncExists = fastSyncExists;
    }

    public boolean isDeleteFastSync() {
        return deleteFastSync;
    }

    public void setDeleteFastSync(boolean deleteFastSync) {
        this.deleteFastSync = deleteFastSync;
    }
}
