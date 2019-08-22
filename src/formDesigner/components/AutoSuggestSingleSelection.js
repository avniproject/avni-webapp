import React from "react";
import { deburr } from "lodash";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import axios from "axios";

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
          <span key={part.text} style={{ fontWeight: part.highlight ? 500 : 400 }}>
            {part.text}
          </span>
        ))}
      </div>
    </MenuItem>
  );
}

function getSuggestionValue(suggestion) {
  return suggestion;
}

const useStyles = theme => ({
  root: {
    height: 250,
    flexGrow: 1
  },
  container: {
    position: "relative",
    marginTop: 10,
    width: 400
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
  const classes = useStyles();
  const MAX_NUMBER_OF_SUGGESTIONS = 20;

  const [state, setState] = React.useState({
    single: ""
  });

  const [stateSuggestions, setSuggestions] = React.useState([]);

  const handleSuggestionsFetchRequested = ({ value }) => {
    const inputValue = deburr(value.trim()).toLowerCase();

    axios
      .get(`/search/concept?name=${inputValue}`)
      .then(response => {
        const suggestions = response.data
          .slice(0, MAX_NUMBER_OF_SUGGESTIONS)
          .map(concept => concept.name)
          .sort();
        setSuggestions(suggestions);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleChange = name => (event, { newValue }) => {
    setState({
      ...state,
      [name]: newValue
    });
    props.onChangeAnswerName(newValue, props.index);
    console.log({ newValue });
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
      {props.visibility && (
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            classes,
            id: "answer",
            required: true,
            label: "Answer",
            placeholder: "Enter answer",
            value: props.showAnswer,
            onChange: handleChange("single"),
            disabled: props.visibility
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
      )}
      {!props.visibility && (
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            classes,
            id: "answer",
            required: true,
            label: "Answer",
            placeholder: "Enter answer",

            value: state.single,
            onChange: handleChange("single"),
            disabled: props.visibility
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
      )}
      <div className={classes.divider} />
    </div>
  );
}
