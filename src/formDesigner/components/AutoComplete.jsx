import { useState } from "react";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import deburr from "lodash/deburr";
import Downshift from "downshift";
import { TextField, Paper, MenuItem, Chip } from "@mui/material";

const Container = styled("div")({
  flexGrow: 1,
  position: "relative"
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: "fixed",
  zIndex: 1,
  marginTop: theme.spacing(1)
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5, 0.25)
}));

const StyledTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    flexWrap: "wrap"
  },
  "& .MuiInputBase-input": {
    width: "auto",
    flexGrow: 1
  }
});

function renderInput(inputProps) {
  const { InputProps, ref, ...other } = inputProps;

  return (
    <StyledTextField
      InputProps={{
        inputRef: ref,
        ...InputProps
      }}
      {...other}
    />
  );
}

renderInput.propTypes = {
  InputProps: PropTypes.object
};

function renderSuggestion(suggestionProps) {
  const {
    suggestion,
    index,
    itemProps,
    highlightedIndex,
    selectedItem
  } = suggestionProps;
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || "").indexOf(suggestion.label) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestion.label}
    </MenuItem>
  );
}

renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.oneOfType([
    PropTypes.oneOf([null]),
    PropTypes.number
  ]).isRequired,
  index: PropTypes.number.isRequired,
  itemProps: PropTypes.object.isRequired,
  selectedItem: PropTypes.string.isRequired,
  suggestion: PropTypes.shape({
    label: PropTypes.string.isRequired
  }).isRequired
};

function getSuggestions(suggestions, value, { showEmpty = false } = {}) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0 && !showEmpty
    ? []
    : suggestions.filter(suggestion => {
        const keep =
          count < 5 &&
          suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;
        if (keep) {
          count += 1;
        }
        return keep;
      });
}

function DownshiftMultiple(props) {
  const [inputValue, setInputValue] = useState("");
  // Note: `props.setEncounterTypes` might be a misnamed prop; ensure it's an array of initial values
  const [selectedItem, setSelectedItem] = useState(
    props.setEncounterTypes || []
  );

  function handleKeyDown(event) {
    if (
      selectedItem.length &&
      !inputValue.length &&
      event.key === "Backspace"
    ) {
      setSelectedItem(selectedItem.slice(0, selectedItem.length - 1));
    }
  }

  function handleInputChange(event) {
    setInputValue(event.target.value);
  }

  function handleChange(item) {
    let newSelectedItem = [...selectedItem];
    if (newSelectedItem.indexOf(item) === -1) {
      newSelectedItem = [...newSelectedItem, item];
    }
    setInputValue("");
    setSelectedItem(newSelectedItem);
    props.OnGetSelectedValue(newSelectedItem);
  }

  const handleDelete = item => () => {
    const newSelectedItem = [...selectedItem];
    newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
    setSelectedItem(newSelectedItem);
  };

  return (
    <Downshift
      id="downshift-multiple"
      inputValue={inputValue}
      onChange={handleChange}
      selectedItem={selectedItem}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        isOpen,
        inputValue: inputValue2,
        selectedItem: selectedItem2,
        highlightedIndex
      }) => {
        const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
          onKeyDown: handleKeyDown,
          placeholder: "Select multiple encounter types"
        });

        return (
          <Container>
            {renderInput({
              fullWidth: true,
              label: "Encounter Type",
              InputLabelProps: getLabelProps(),
              InputProps: {
                startAdornment: selectedItem.map(item => (
                  <StyledChip
                    key={item}
                    tabIndex={-1}
                    label={item}
                    onDelete={handleDelete(item)}
                  />
                )),
                onBlur,
                onChange: event => {
                  handleInputChange(event);
                  onChange(event);
                },
                onFocus
              },
              inputProps
            })}
            {isOpen ? (
              <StyledPaper square>
                {getSuggestions(props.suggestions, inputValue2).map(
                  (suggestion, index) =>
                    renderSuggestion({
                      suggestion,
                      index,
                      itemProps: getItemProps({ item: suggestion.label }),
                      highlightedIndex,
                      selectedItem: selectedItem2
                    })
                )}
              </StyledPaper>
            ) : null}
          </Container>
        );
      }}
    </Downshift>
  );
}

DownshiftMultiple.propTypes = {
  suggestions: PropTypes.array.isRequired,
  OnGetSelectedValue: PropTypes.func.isRequired,
  setEncounterTypes: PropTypes.array
};

export default DownshiftMultiple;
