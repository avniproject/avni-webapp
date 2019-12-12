import React from "react";
import Autosuggest from "react-autosuggest";
import http from "common/utils/httpClient";

const LocationAutosuggest = ({ onSelect }) => {
  const [value, setValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState([]);

  const getSuggestionValue = suggestion => suggestion.title;

  const renderSuggestion = suggestion => <div>{suggestion.title}</div>;

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions(value);
    setSuggestions(suggestions);
  };

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const onSuggestionSelected = (event, { suggestion }) => onSelect(suggestion);

  const getSuggestions = async value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : await http
          .get(`locations/search/find?title=${inputValue}`)
          .then(res => res.data._embedded.locations);
  };

  const inputProps = {
    placeholder: "Type a programming language",
    value,
    onChange
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      onSuggestionSelected={onSuggestionSelected}
    />
  );
};

export default LocationAutosuggest;
