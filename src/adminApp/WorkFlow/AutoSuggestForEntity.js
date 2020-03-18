import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Autosuggest from "react-autosuggest";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

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

function AutoSuggestForEntity(props) {
  const classes = useStyles();
  const [suggestions, setSuggestions] = useState([]);

  const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    let temp =
      inputLength === 0
        ? []
        : props.entity.filter(
            lang =>
              lang.name.toLowerCase().slice(0, inputLength) === inputValue &&
              !props.removeDuplicate.includes(lang.uuid)
          );

    temp.unshift({ name: "create" });
    return temp;
  };

  const renderInputComponent = inputProps => {
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
  };

  const getSuggestionValue = suggestion => {
    props.setName(suggestion.name);
    suggestion.name !== "create" && props.onAdd(false, suggestion.name);
    return suggestion.name;
  };

  const renderSuggestion = suggestion => (
    <div>
      {suggestion.name !== "create" && (
        <MenuItem component="div">
          <div>
            <span>{suggestion.name}</span>
          </div>
        </MenuItem>
      )}

      {suggestion.name === "create" && (
        <MenuItem
          component="div"
          onClick={() => props.onAdd(true, "")}
          style={{ backgroundColor: "primary" }}
        >
          <Button color="primary" style={{ width: "100%" }}>
            {props.buttonName}
          </Button>
        </MenuItem>
      )}
    </div>
  );

  const onChange = (event, { newValue }) => {
    props.setName(newValue === "create" ? "" : newValue);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const autosuggestProps = {
    renderInputComponent,
    suggestions: suggestions,
    onSuggestionsFetchRequested: onSuggestionsFetchRequested,
    onSuggestionsClearRequested: onSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion
  };

  return (
    <div className={classes.root}>
      <Autosuggest
        {...autosuggestProps}
        inputProps={{
          classes,
          placeholder: props.placeholder,
          value: props.name,
          onChange: onChange
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

export default React.memo(AutoSuggestForEntity);
