import { useState, useEffect } from "react";
import _, { deburr } from "lodash";
import { Autocomplete, TextField, Paper, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import { httpClient as http } from "common/utils/httpClient";

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  width: "100%",
  minWidth: "300px",
  marginTop: theme.spacing(1.25)
}));

export default function AutoSuggestSingleSelection({
  dataTypesToIgnore = [],
  dataType,
  showSuggestionStartsWith = false,
  finalReturn = false,
  inlineConcept,
  onChangeAnswerName,
  index,
  groupIndex,
  elementIndex,
  showAnswer = { name: "" },
  label = "",
  placeholder = "",
  visibility = false
}) {
  const ignoredDatatypesFromProps = dataTypesToIgnore || [];
  const dataTypesToIgnoreList = [...ignoredDatatypesFromProps, "NA"];

  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(showAnswer?.name || "");
  const [loading, setLoading] = useState(false);

  // Update inputValue when showAnswer changes
  useEffect(() => {
    setInputValue(showAnswer?.name || "");
  }, [showAnswer?.name]);

  const fetchSuggestions = async value => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const inputValueLower = deburr(value.trim()).toLowerCase();
    const queryString = _.isEmpty(dataType)
      ? "name=" + encodeURIComponent(inputValueLower)
      : "name=" + encodeURIComponent(inputValueLower) + "&dataType=" + dataType;
    const inputLength = inputValueLower.length;

    try {
      const response = await http.get(`/search/concept?${queryString}`);
      const suggestions = response.data;
      _.sortBy(suggestions, concept => concept.name);

      let filteredSuggestions;
      if (showSuggestionStartsWith) {
        filteredSuggestions = suggestions.filter(
          suggestion =>
            !suggestion.voided &&
            suggestion.name.slice(0, inputLength).toLowerCase() ===
              inputValueLower
        );
      } else {
        filteredSuggestions = suggestions.filter(
          suggestion =>
            !suggestion.voided &&
            !_.includes(dataTypesToIgnoreList, suggestion.dataType)
        );
      }
      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    console.log("AutoSuggest handleChange:", {
      newValue,
      finalReturn,
      inlineConcept
    });

    if (finalReturn && newValue && typeof newValue === "object") {
      // When finalReturn is true, pass the full object
      if (!inlineConcept) {
        onChangeAnswerName(newValue, index);
      } else {
        onChangeAnswerName(newValue, groupIndex, elementIndex, index);
      }
    } else {
      // Handle string input or object with name property
      let autoSuggestedName = "";
      if (typeof newValue === "string") {
        autoSuggestedName = newValue;
      } else if (newValue && newValue.name) {
        autoSuggestedName = newValue.name;
      }

      if (!inlineConcept) {
        onChangeAnswerName(autoSuggestedName, index, false);
      } else {
        onChangeAnswerName(autoSuggestedName, groupIndex, elementIndex, index);
      }
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    fetchSuggestions(newInputValue);
  };

  return (
    <StyledAutocomplete
      options={suggestions}
      getOptionLabel={option => {
        if (typeof option === "string") return option;
        return option?.name || "";
      }}
      isOptionEqualToValue={(option, value) => {
        // Handle comparison between different types
        if (!option || !value) return false;

        const optionName = typeof option === "string" ? option : option.name;
        const valueName = typeof value === "string" ? value : value.name;

        return optionName === valueName;
      }}
      value={showAnswer}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loading={loading}
      disabled={visibility}
      freeSolo
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={true}
          autoFocus={true}
        />
      )}
      renderOption={(props, option) => (
        <MenuItem {...props} key={option.uuid || option.name}>
          {option.name} ({option.dataType})
        </MenuItem>
      )}
      PaperComponent={Paper}
    />
  );
}
