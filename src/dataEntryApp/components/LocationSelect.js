import React from "react";
import { useTranslation } from "react-i18next";
import { deburr, get, isEmpty, map } from "lodash";
import { locationNameRenderer } from "../utils/LocationUtil";
import { addressLevelService } from "../services/AddressLevelService";
import AsyncSelect from "react-select/async";
import httpClient from "../../common/utils/httpClient";

const LocationSelect = ({ onSelect, selectedLocation, placeholder, typeId }) => {
  const { t } = useTranslation();
  const [selectedLocationValue, setSelectedLocationValue] = React.useState();
  const [defaultOptions, setDefaultOptions] = React.useState([]);

  React.useEffect(() => {
    if (selectedLocationValue && selectedLocationValue.value.typeId !== typeId) {
      setSelectedLocationValue(null);
      onSelect({});
    }
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

  React.useEffect(() => {
    fetchLocation("", setDefaultOptions);
  }, []);

  const onLocationSelected = location => {
    onSelect(location.value);
    addressLevelService.addAddressLevel(location.value);
  };

  const formatOptionLabel = ({ optionLabel }) => {
    return (
      <div style={{ display: "flex" }}>
        <div>{optionLabel}</div>
      </div>
    );
  };

  const loadLocations = (value, callback) => {
    if (!value) {
      return callback([]);
    }
    return fetchLocation(value, callback);
  };

  function fetchLocation(value, callback) {
    const inputValue = deburr(value.trim()).toLowerCase();
    let title = encodeURIComponent(inputValue);
    let apiUrl = `/locations/search/find?title=${title}&addressLevelTypeId=${typeId}&size=100&page=0`;
    return httpClient
      .get(apiUrl)
      .then(response => callback(getLocationOptions(get(response, "data.content", []))))
      .catch(error => {
        console.log(error);
      });
  }

  const getLocationOptions = locations =>
    map(locations, location => ({
      label: location.title,
      value: location.id,
      optionLabel: locationNameRenderer(location)
    }));

  return (
    <div style={{ width: "30%" }}>
      <AsyncSelect
        name="locations"
        isSearchable
        cacheOptions
        defaultOptions={defaultOptions}
        value={selectedLocationValue}
        placeholder={t(placeholder)}
        onChange={onLocationSelected}
        loadOptions={loadLocations}
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  );
};

export default LocationSelect;
