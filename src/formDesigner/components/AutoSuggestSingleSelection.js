import React from "react";
import { deburr } from "lodash";
import _ from "lodash";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import http from "common/utils/httpClient";

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input
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
          <span key={part.text.name} style={{ fontWeight: part.highlight ? 500 : 400 }}>
            {part.text.name + " (" + part.text.dataType + ")"}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

const useStyles = theme => ({
  root: {
    height: 250,
    flexGrow: 1
  },
  container: {
    position: "relative",
    marginTop: 10,
    width: "100%"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    right: 0,
    overflow: "auto",
    maxHeight: "400%"
  },
  suggestion: {
    display: "block"
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
});

export default function AutoSuggestSingleSelection(props) {
  const ignoredDatatypesFromProps = props.dataTypesToIgnore || [];
  const classes = useStyles();
  const dataTypesToIgnore = [...ignoredDatatypesFromProps, "NA"];
  const [state, setState] = React.useState({
    single: ""
  });
  const [stateSuggestions, setSuggestions] = React.useState([]);

  const handleSuggestionsFetchRequested = ({ value }) => {
    const inputValue = deburr(value.trim()).toLowerCase();
    const dataType = props.dataType;
    const queryString = _.isEmpty(dataType)
      ? "name=" + encodeURIComponent(inputValue)
      : "name=" + encodeURIComponent(inputValue) + "&dataType=" + dataType;
    const inputLength = inputValue.length;

    http.get(`/search/concept?${queryString}`).then(response => {
      const suggestions = response.data;
      _.sortBy(suggestions, function(concept) {
        return concept.name;
      });
      if (props.showSuggestionStartsWith) {
        const filteredSuggestions = suggestions.filter(suggestion => {
          return !suggestion.voided && suggestion.name.slice(0, inputLength).toLowerCase() === inputValue;
        });
        setSuggestions(filteredSuggestions);
      } else {
        const filteredSuggestions = suggestions.filter(suggestion => {
          return !suggestion.voided && !_.includes(dataTypesToIgnore, suggestion.dataType);
        });
        setSuggestions(filteredSuggestions);
      }
    });
  };

  const getSuggestionValue = suggestion => {
    if (props.finalReturn) {
      !props.inlineConcept && props.onChangeAnswerName(suggestion, props.index);
      props.inlineConcept && props.onChangeAnswerName(suggestion, props.groupIndex, props.elementIndex, props.index);
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
    //    if (!props.finalReturn) {
    !props.inlineConcept && props.onChangeAnswerName(autoSuggestedName, props.index, false);
    props.inlineConcept &&
      props.inlineConcept &&
      props.onChangeAnswerName(autoSuggestedName, props.groupIndex, props.elementIndex, props.index);

    //    }
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
    <div className={classes.root}>
      <Autosuggest
        {...autosuggestProps}
        inputProps={{
          classes,
          required: true,
          label: props.label,
          placeholder: props.placeholder,
          value: props.showAnswer.name,
          onChange: handleChange("single"),
          disabled: props.visibility,
          autoFocus: true
        }}
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion
        }}
        renderSuggestionsContainer={options => (
          <Paper {...options.containerProps} square>
            {options.children}
          </Paper>
        )}
      />

      <div className={classes.divider} />
    </div>
  );
}

AutoSuggestSingleSelection.defaultProps = {
  finalReturn: false,
  showSuggestionStartsWith: false
};
