import React from "react";
import http from "common/utils/httpClient";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { isEmpty } from "lodash";

const LocationSelect = ({ onSelect, selectedLocation, placeholder, typeId }) => {
  const { t } = useTranslation();

  const locationNameRenderer = location => {
    if (isEmpty(location.name)) {
      return "";
    }
    let retVal = `${location.name} (${location.type})`;
    let lineageParts = location.titleLineage.split(", ");
    if (lineageParts.length > 1)
      retVal += ` in ${lineageParts.slice(0, lineageParts.length - 1).join(" > ")}`;
    return retVal;
  };

  const [locationMap, setLocationMap] = React.useState(new Map());
  const [locationOptions, setLocationOptions] = React.useState([]);
  const [selectedLocationValue, setSelectedLocationValue] = React.useState();

  React.useEffect(() => {
    async function fetchLocations() {
      return await getLocationsByType(typeId);
    }

    if (selectedLocationValue && selectedLocationValue.value.typeId !== typeId) {
      setSelectedLocationValue(null);
      onSelect({});
    }
    fetchLocations().then(locations => {
      setLocationOptions(
        locations.map(location => ({
          label: location.name,
          value: location,
          optionLabel: locationNameRenderer(location)
        }))
      );
    });
  }, [typeId]);

  React.useEffect(() => {
    if (!isEmpty(selectedLocation)) {
      setSelectedLocationValue({
        label: selectedLocation.name,
        value: selectedLocation,
        optionLabel: locationNameRenderer(selectedLocation)
      });
    }
  }, [selectedLocation]);

  const onLocationSelected = location => onSelect(location.value);

  const getLocationsByType = async typeId => {
    if (locationMap.has(typeId)) {
      return locationMap.get(typeId);
    } else {
      return await http.get(`/locations/search/typeId/${typeId}`).then(res => {
        setLocationMap(currentMap => currentMap.set(typeId, res.data));
        return res.data || [];
      });
    }
  };

  const formatOptionLabel = ({ optionLabel }) => {
    return (
      <div style={{ display: "flex" }}>
        <div>{optionLabel}</div>
      </div>
    );
  };

  return (
    <div style={{ width: "30%" }}>
      <Select
        name="locations"
        isSearchable
        options={locationOptions}
        onChange={onLocationSelected}
        value={selectedLocationValue}
        placeholder={t(placeholder)}
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  );
};

export default LocationSelect;
