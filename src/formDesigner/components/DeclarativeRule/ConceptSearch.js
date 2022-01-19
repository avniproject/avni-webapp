import AsyncSelect from "react-select/async";
import React from "react";
import { deburr, includes, map, isEmpty } from "lodash";
import http from "../../../common/utils/httpClient";

const ConceptSearch = ({ value, onChange, nonSupportedTypes = [], isMulti, placeholder }) => {
  const [options, setOptions] = React.useState([]);
  const loadConcept = (value, callback) => {
    if (!value) {
      return callback([]);
    }
    const inputValue = deburr(value.trim()).toLowerCase();
    http
      .get("/search/concept?name=" + encodeURIComponent(inputValue))
      .then(response => {
        const concepts = response.data;
        const filteredConcepts = concepts.filter(
          concept => !includes(nonSupportedTypes, concept.dataType)
        );
        const conceptOptions = map(filteredConcepts, ({ name, uuid, dataType }) => ({
          label: name,
          value: { name, uuid, dataType, toString: () => uuid }
        }));
        setOptions(conceptOptions);
        callback(conceptOptions);
      })
      .catch(error => {
        console.log(error);
      });
  };
  return (
    <AsyncSelect
      cacheOptions
      isMulti={isMulti}
      defaultOptions={options}
      value={isEmpty(value) ? null : value}
      placeholder={placeholder || "Type to search concept"}
      onChange={onChange}
      loadOptions={loadConcept}
    />
  );
};

export default ConceptSearch;
