import React from "react";
import { map, get } from "lodash";
import http from "common/utils/httpClient";
import CommonSearch from "../../formDesigner/common/CommonSearch";

const DocumentationSearch = ({ value, onChange, isMulti, placeholder }) => {
  const loadDocumentation = (value, callback) => {
    return http.get("/search/documentation?name=" + value).then(response => {
      const options = map(get(response, "data.content", []), ({ name, uuid }) => ({
        label: name,
        value: uuid
      }));
      return callback(options);
    });
  };

  return (
    <CommonSearch
      value={value}
      onChange={onChange}
      isMulti={isMulti}
      placeholder={placeholder || "Type to search Documentation"}
      loadOptionsByValue={loadDocumentation}
    />
  );
};

export default DocumentationSearch;
