import http from "../../common/utils/httpClient";
import { map } from "lodash";
import CommonSearch from "./CommonSearch";
import React from "react";

const LocationTypeSearch = ({ value, onChange, isMulti }) => {
  const loadLocation = (value, callback) => {
    http.get("/search/locationType?name=" + value).then(response => {
      const locationTypes = response.data;
      const locationTypeOptions = map(locationTypes, ({ name, uuid }) => ({
        label: name,
        value: { name, uuid, toString: () => uuid }
      }));
      callback(locationTypeOptions);
    });
  };

  return (
    <CommonSearch
      value={value}
      onChange={onChange}
      isMulti={isMulti}
      placeholder={"Search location type"}
      loadOptionsByValue={loadLocation}
    />
  );
};

export default LocationTypeSearch;
