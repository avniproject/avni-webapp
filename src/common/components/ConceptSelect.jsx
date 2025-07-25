import AsyncSelect from "react-select/async";
import { deburr, map } from "lodash";
import { httpClient as http } from "common/utils/httpClient";

const buildConceptOptions = concepts => {
  const conceptOptions = concepts.map(concept => ({
    label: concept.name,
    value: concept.uuid,
    concept
  }));
  return conceptOptions;
};

export const ConceptSelect = ({ concepts, setConcepts }) => {
  const onChange = conceptOptions => {
    const selectedConcepts = map(
      conceptOptions,
      conceptOption => conceptOption.concept
    );
    setConcepts(selectedConcepts);
  };

  const loadConcepts = async value => {
    const inputValue = deburr(value.trim()).toLowerCase();
    const response = await http.get(
      "/search/concept?name=" + encodeURIComponent(inputValue)
    );
    const filteredConcepts = response.data.filter(
      concept => concept.dataType !== "NA" && concept.dataType !== "Duration"
    );
    return buildConceptOptions(filteredConcepts);
  };

  return (
    <AsyncSelect
      isMulti
      cacheOptions
      defaultValue={buildConceptOptions(concepts)}
      loadOptions={loadConcepts}
      onChange={onChange}
    />
  );
};
