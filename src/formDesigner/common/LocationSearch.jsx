import { httpClient as http } from "../../common/utils/httpClient";
import { get, map } from "lodash";
import CommonSearch from "./CommonSearch";
import { useState, useEffect } from "react";

const LocationSearch = ({ value, onChange, isMulti }) => {
  const [defaultOptions, setDefaultOptions] = useState([]);

  useEffect(() => {
    loadLocation("", setDefaultOptions);
  }, []);

  const loadLocation = (value, callback) => {
    let apiUrl = `/locations/search/find?title=${value}&size=100&page=0`;
    http.get(apiUrl).then(response => {
      const locations = get(response, "data.content", []);
      const locationOptions = map(locations, ({ title, uuid, typeString }) => ({
        label: `${title} (${typeString})`,
        value: { name: title, title, uuid, typeString, toString: () => uuid }
      }));
      callback(locationOptions);
    });
  };

  return (
    <CommonSearch
      value={value}
      onChange={onChange}
      isMulti={isMulti}
      placeholder={"Search location"}
      defaultOptions={defaultOptions}
      loadOptionsByValue={loadLocation}
    />
  );
};

export default LocationSearch;
