import React from "react";
import { includes, map } from "lodash";
import http from "../../../common/utils/httpClient";
import CommonSearch from "../../common/CommonSearch";

const ConceptSearch = ({ value, onChange, nonSupportedTypes = [], isMulti, placeholder, defaultOptions = [] }) => {
  const loadConcept = (value, callback) => {
    http.get("/search/concept?name=" + value).then(response => {
      const concepts = response.data;
      const filteredConcepts = concepts.filter(concept => !includes(nonSupportedTypes, concept.dataType));
      const conceptOptions = map(filteredConcepts, ({ name, uuid, dataType }) => ({
        label: name,
        value: { name, uuid, dataType, toString: () => uuid }
      }));
      callback(conceptOptions);
    });
  };

  return (
    <CommonSearch
      value={value}
      onChange={onChange}
      isMulti={isMulti}
      placeholder={placeholder || "Type to search concept"}
      defaultOptions={defaultOptions}
      loadOptionsByValue={loadConcept}
    />
  );
};

export default ConceptSearch;
