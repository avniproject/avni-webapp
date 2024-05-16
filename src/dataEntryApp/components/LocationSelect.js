import React from "react";
import { useTranslation } from "react-i18next";
import { debounce, deburr, get, isEmpty, map } from "lodash";
import { locationNameRenderer } from "../utils/LocationUtil";
import { addressLevelService } from "../services/AddressLevelService";
import AsyncSelect from "react-select/async";
import httpClient from "../../common/utils/httpClient";

const LocationSelect = ({ onSelect, selectedLocation, placeholder, typeId, parentId }) => {
  const { t } = useTranslation();
  const [selectedLocationValue, setSelectedLocationValue] = React.useState();
  const [defaultOptions, setDefaultOptions] = React.useState([]);

  React.useEffect(() => {
    if (selectedLocationValue && selectedLocationValue.typeId !== typeId) {
      setSelectedLocationValue(null);
    }
  }, [typeId]);

  React.useEffect(() => {
    if (!isEmpty(selectedLocation)) {
      setSelectedLocationValue({
        label: selectedLocation.name,
        value: selectedLocation,
        optionLabel: locationNameRenderer(selectedLocation)
      });
    } else {
      setSelectedLocationValue(null);
    }
  }, [selectedLocation]);

  React.useEffect(() => {
    fetchLocation("", setDefaultOptions);
  }, [parentId, typeId]);

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
      callback([]);
    }
    fetchLocation(value, callback);
  };

  const debouncedLoadLocations = debounce(loadLocations, 500);

  const makeParameter = (key, value) => {
    return value ? `&${key}=${value}` : "";
  };

  function fetchLocation(value, callback) {
    const inputValue = deburr(value.trim()).toLowerCase();
    let title = encodeURIComponent(inputValue);
    let apiUrl = `/locations/search/find?title=${title}${makeParameter("typeId", typeId)}${makeParameter(
      "parentId",
      parentId
    )}&size=100&page=0`;
    httpClient.get(apiUrl).then(response => callback(getLocationOptions(get(response, "data.content", []))));
  }

  const getLocationOptions = locations =>
    map(locations, location => ({
      label: location.title,
      value: location,
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
        loadOptions={debouncedLoadLocations}
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  );
};

export default LocationSelect;
