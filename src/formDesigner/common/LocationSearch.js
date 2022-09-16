import http from "../../common/utils/httpClient";
import _, { get, map } from "lodash";
import CommonSearch from "./CommonSearch";
import React from "react";

const LocationSearch = ({ value, onChange, isMulti }) => {
  const loadLocation = (value, callback) => {
    let apiUrl = `/locations/search/find?title=${value}&size=100&page=0`;
    return http.get(apiUrl).then(response => {
      const locations = get(response, "data.content", []);
      const locationOptions = map(locations, ({ title, uuid, typeString }) => ({
        label: `${title} (${typeString})`,
        value: { title, uuid, typeString, toString: () => uuid }
      }));
      return callback(locationOptions);
    });
  };

  return (
    <CommonSearch
      value={value}
      onChange={onChange}
      isMulti={isMulti}
      placeholder={"Search location"}
      loadOptionsByValue={loadLocation}
    />
  );
};

export default LocationSearch;
