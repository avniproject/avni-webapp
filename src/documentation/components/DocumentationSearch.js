import React from "react";
import { get, isEmpty, isNil, map } from "lodash";
import http from "common/utils/httpClient";
import CommonSearch from "../../formDesigner/common/CommonSearch";

const getAllParents = (documentation, parents) => {
  if (isNil(documentation)) return parents;
  parents.push(documentation.name);
  return getAllParents(documentation.parent, parents);
};

const DocumentationSearch = ({ value, onChange, isMulti, placeholder }) => {
  const loadDocumentation = (value, callback) => {
    return http.get("/search/documentation?name=" + value).then(response => {
      const options = map(get(response, "data.content", []), ({ name, uuid, parent }) => {
        const allParents = getAllParents(parent, []);
        const label = isEmpty(allParents) ? name : `${name} in (${allParents.join(" -> ")})`;
        return {
          label: label,
          value: uuid
        };
      });
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
