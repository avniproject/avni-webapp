import http from "../../common/utils/httpClient";
import { map } from "lodash";
import CommonSearch from "./CommonSearch";
import React from "react";

const LocationSearch = ({ value, onChange, isMulti }) => {
  const loadLocation = (value, callback) => {
    return http.get("/search/location?name=" + value).then(response => {
      const locations = response.data;
      const locationOptions = map(locations, ({ name, uuid, type }) => ({
        label: `${name} (${type})`,
        value: { name, uuid, type, toString: () => uuid }
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
