import React from "react";
import Autosuggest from "react-autosuggest";
import http from "common/utils/httpClient";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  rautosuggestinput: {
    width: "30%",
    height: "30px",
    padding: "20px 20px",
    "font-family": " Helvetica, sans-serif",
    "font-weight": 300,
    "font-size": 16,
    border: "0px solid #aaa",
    borderBottom: "1px solid lightgray",
    "border-radius": "4px"
  },
  errmsg: {
    color: "#f44336",
    "font-family": "Roboto",
    "font-weight": 400,
    "font-size": "0.75rem"
  }
}));

const LocationAutosuggest = ({
  onSelect,
  selectedLocation,
  data,
  errorMsg,
  placeholder,
  typeId
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // if (data.saved === true) {
  //   selectedLocation = "";
  // } else if (data.saved === false && selectedLocation === undefined) {
  //   selectedLocation = "";
  // } else {
  //   selectedLocation = selectedLocation;
  // }

  const [value, setValue] = React.useState(selectedLocation);
  const [suggestions, setSuggestions] = React.useState([]);
  const [firstnameerrormsg, setFirstnamemsg] = React.useState("");

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
      : // .get(`locations/search/autocompleteLocationsOfType?title=${inputValue}&typeId=${typeId}`)
        // : await http.get(`locations/search/find?title=${inputValue}`).then(res => {
        await http
          .get(`locations/search/autocompleteLocationsOfType?title=${inputValue}&typeId=${typeId}`)
          .then(res => {
            if (res.data._embedded) {
              return res.data._embedded.locations;
            } else return [];
          });
  };

  const inputProps = {
    className: classes.rautosuggestinput,
    placeholder: `${t(placeholder)}` + " " + `${t("name")}`,
    value,
    onChange
  };

  return (
    <div>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        onSuggestionSelected={onSuggestionSelected}
      />
      {/* {errorMsg && <span className={classes.errmsg}>{t(errorMsg)}</span>} */}
    </div>
  );
};

export default LocationAutosuggest;
