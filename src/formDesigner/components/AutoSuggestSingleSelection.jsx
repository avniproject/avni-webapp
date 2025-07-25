import { useState } from "react";
import _, { deburr } from "lodash";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { TextField, Paper, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import { httpClient as http } from "common/utils/httpClient";

const StyledContainer = styled("div")({
  flexGrow: 1,
  height: 250
});

const StyledAutosuggestContainer = styled("div")(({ theme }) => ({
  position: "relative",
  marginTop: theme.spacing(1.25), // 10px
  width: "100%"
}));

const StyledSuggestionsContainer = styled("div")({
  position: "absolute",
  zIndex: 2,
  left: 0,
  right: 0,
  overflow: "auto",
  maxHeight: "400%"
});

const StyledSuggestionsList = styled("ul")({
  margin: 0,
  padding: 0,
  listStyleType: "none"
});

const StyledSuggestion = styled("li")({
  display: "block"
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1)
  }
}));

function renderInputComponent(inputProps) {
  const { inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <StyledTextField
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        }
      }}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion, query);
  const parts = parse(suggestion, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map(part => (
          <span
            key={part.text.name}
            style={{ fontWeight: part.highlight ? 500 : 400 }}
          >
            {part.text.name + " (" + part.text.dataType + ")"}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

export default function AutoSuggestSingleSelection(props) {
  const ignoredDatatypesFromProps = props.dataTypesToIgnore || [];
  const dataTypesToIgnore = [...ignoredDatatypesFromProps, "NA"];
  const [state, setState] = useState({
    single: ""
  });
  const [stateSuggestions, setSuggestions] = useState([]);

  const handleSuggestionsFetchRequested = ({ value }) => {
    const inputValue = deburr(value.trim()).toLowerCase();
    const dataType = props.dataType;
    const queryString = _.isEmpty(dataType)
      ? "name=" + encodeURIComponent(inputValue)
      : "name=" + encodeURIComponent(inputValue) + "&dataType=" + dataType;
    const inputLength = inputValue.length;

    http.get(`/search/concept?${queryString}`).then(response => {
      const suggestions = response.data;
      _.sortBy(suggestions, concept => concept.name);
      if (props.showSuggestionStartsWith) {
        const filteredSuggestions = suggestions.filter(
          suggestion =>
            !suggestion.voided &&
            suggestion.name.slice(0, inputLength).toLowerCase() === inputValue
        );
        setSuggestions(filteredSuggestions);
      } else {
        const filteredSuggestions = suggestions.filter(
          suggestion =>
            !suggestion.voided &&
            !_.includes(dataTypesToIgnore, suggestion.dataType)
        );
        setSuggestions(filteredSuggestions);
      }
    });
  };

  const getSuggestionValue = suggestion => {
    if (props.finalReturn) {
      !props.inlineConcept && props.onChangeAnswerName(suggestion, props.index);
      props.inlineConcept &&
        props.onChangeAnswerName(
          suggestion,
          props.groupIndex,
          props.elementIndex,
          props.index
        );
    }
    return suggestion;
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleChange = name => (event, { newValue }) => {
    let autoSuggestedName = "";
    const datatype = typeof newValue;
    if (datatype === "string") {
      autoSuggestedName = newValue;
    } else {
      autoSuggestedName = newValue.name;
    }
    setState({
      ...state,
      [name]: autoSuggestedName
    });
    !props.inlineConcept &&
      props.onChangeAnswerName(autoSuggestedName, props.index, false);
    props.inlineConcept &&
      props.onChangeAnswerName(
        autoSuggestedName,
        props.groupIndex,
        props.elementIndex,
        props.index
      );
  };

  const autosuggestProps = {
    renderInputComponent,
    suggestions: stateSuggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion
  };

  return (
    <StyledContainer>
      <Autosuggest
        {...autosuggestProps}
        inputProps={{
          required: true,
          label: props.label,
          placeholder: props.placeholder,
          value: props.showAnswer.name,
          onChange: handleChange("single"),
          disabled: props.visibility,
          autoFocus: true
        }}
        theme={{
          container: StyledAutosuggestContainer,
          suggestionsContainerOpen: StyledSuggestionsContainer,
          suggestionsList: StyledSuggestionsList,
          suggestion: StyledSuggestion
        }}
        renderSuggestionsContainer={options => (
          <Paper {...options.containerProps} square>
            {options.children}
          </Paper>
        )}
      />
    </StyledContainer>
  );
}

AutoSuggestSingleSelection.defaultProps = {
  finalReturn: false,
  showSuggestionStartsWith: false
};
