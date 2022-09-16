import React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { map, isEmpty, isEqual, isFunction, deburr, get, sortBy, noop } from "lodash";
import AsyncSelect from "react-select/async";
import httpClient from "../utils/httpClient";
import { Grid } from "@material-ui/core";
import { locationNameRenderer } from "../../dataEntryApp/utils/LocationUtil";

const AddressLevelsByType = ({
  label,
  addressLevelsIds = [],
  setAddressLevelsIds,
  setError = noop
}) => {
  const [selectedAddresses, setSelectedAddresses] = React.useState([]);
  const [defaultOptions, setDefaultOptions] = React.useState([]);

  React.useEffect(() => {
    const ids = map(selectedAddresses, ({ value }) => value);
    if (!isEqual(sortBy(ids), sortBy(addressLevelsIds))) {
      httpClient
        .get(`/locations/search/findAllById?ids=${addressLevelsIds}`)
        .then(response => setSelectedAddresses(getLocationOptions(response.data)));
    }
  }, []);

  React.useEffect(() => {
    fetchLocation("", setDefaultOptions);
  }, []);

  const loadLocations = (value, callback) => {
    if (!value) {
      return callback([]);
    }
    return fetchLocation(value, callback);
  };

  function fetchLocation(value, callback) {
    const inputValue = deburr(value.trim()).toLowerCase();
    let title = encodeURIComponent(inputValue);
    let apiUrl = `/locations/search/find?title=${title}&size=100&page=0`;
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

  const onChange = event => {
    setSelectedAddresses(event);
    const ids = map(event, ({ value }) => value);
    setAddressLevelsIds(ids);
    //Spring batch JobParameter string max length is 250
    if (isFunction(setError) && ids.join(",").length > 250) {
      setError("You cannot pass these many addresses to the job.");
    } else {
      setError(undefined);
    }
  };

  return (
    <Grid item xs={6} style={{ marginBottom: "10px" }}>
      <FormControl fullWidth component="fieldset">
        <FormLabel component="legend">{label}</FormLabel>
        <AsyncSelect
          cacheOptions
          defaultOptions={defaultOptions}
          isMulti
          value={selectedAddresses}
          placeholder={`Start typing and select`}
          onChange={onChange}
          loadOptions={loadLocations}
          formatOptionLabel={({ optionLabel }) => <div>{optionLabel}</div>}
        />
      </FormControl>
    </Grid>
  );
};

export default AddressLevelsByType;
