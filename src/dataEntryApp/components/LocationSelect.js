import React from "react";
import http from "common/utils/httpClient";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { isEmpty } from "lodash";

const LocationSelect = ({ onSelect, selectedLocation, placeholder, typeId }) => {
  const { t } = useTranslation();

  const [locationMap, setLocationMap] = React.useState(new Map());
  const [locationOptions, setLocationOptions] = React.useState([]);
  const [selectedLocationValue, setSelectedLocationValue] = React.useState();

  React.useEffect(() => {
    async function fetchLocations() {
      return await getLocationsByType(typeId);
    }

    if (selectedLocationValue && selectedLocationValue.typeId !== typeId) {
      setSelectedLocationValue(null);
      onSelect({});
    }
    fetchLocations().then(locations => {
      setLocationOptions(locations.map(location => ({ label: location.name, value: location })));
    });
  }, [typeId]);

  React.useEffect(() => {
    if (!isEmpty(selectedLocation)) {
      setSelectedLocationValue({
        label: selectedLocation,
        value: locationOptions.find(location => location.title === selectedLocation)
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

  return (
    <div style={{ width: "30%" }}>
      <Select
        name="locations"
        isSearchable
        options={locationOptions}
        onChange={onLocationSelected}
        value={selectedLocationValue}
        placeholder={t(placeholder)}
      />
    </div>
  );
};

export default LocationSelect;
