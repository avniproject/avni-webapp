import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import deburr from "lodash/deburr";
import MenuItem from "@material-ui/core/MenuItem";

class CodedDataType extends Component {
  constructor() {
    super();
    this.state = {
      flag: true,
      answers: [{ answer: "", uuid: "", unique: false, abnormal: false }],
      suggestions: [
        { label: "Afghanistan" },
        { label: "Aland Islands" },
        { label: "Albania" },
        { label: "Algeria" },
        { label: "American Samoa" },
        { label: "Andorra" },
        { label: "Angola" },
        { label: "Anguilla" },
        { label: "Antarctica" },
        { label: "Antigua and Barbuda" },
        { label: "Argentina" },
        { label: "Armenia" },
        { label: "Aruba" },
        { label: "Australia" }
      ]
    };
  }

  handleChange = event => {
    this.props.sendValue(this.state.answers);
  };

  addAnswer = () => {
    this.setState({
      flag: true
    });
  };

  getChangeData = (event, index) => {
    const ans = [...this.state.answers];
    ans[index][event.target.id] = !ans[index][event.target.id];
    this.setState(
      {
        answers: ans
      },
      () => {
        console.log(this.state.answers);
      }
    );
  };

  getChangeAnswer = (event, index) => {
    const answers = [...this.state.answers];
    answers[index].answer = event.target.value;
    this.setState(
      {
        answers: answers
      },
      () => {
        console.log(this.state.answers);
      }
    );
  };

  addCodedAnswer = () => {
    this.setState({
      answers: [...this.state.answers, { answer: "", uuid: "", unique: false, abnormal: false }]
    });
  };
  removeCodedAnswer = index => {
    console.log(index);
    const answers = [...this.state.answers];
    answers.splice(index, 1);
    answers.indexOf(answers[index], 1);
    this.setState(
      {
        answers: answers
      },
      () => {
        console.log(this.state.answers);
      }
    );
  };
  renderInput = inputProps => {
    const { InputProps, classes, ref, ...other } = inputProps;

    return (
      <TextField
        InputProps={{
          inputRef: ref,
          ...InputProps
        }}
        {...other}
      />
    );
  };

  getSuggestions = (value, { showEmpty = false } = {}) => {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0 && !showEmpty
      ? []
      : this.state.suggestions.filter(suggestion => {
          const keep =
            count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

          if (keep) {
            count += 1;
          }

          return keep;
        });
  };

  renderSuggestion = suggestionProps => {
    const { suggestion, index, itemProps, highlightedIndex, selectedItem } = suggestionProps;
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
  };
  render() {
    const useStyles = makeStyles(theme => ({
      button: {
        margin: theme.spacing(1),
        height: "35px",
        width: "10%",
        marginTop: 20
      }
    }));
    return (
      <>
        <Grid container onChange={this.handleChange}>
          {this.state.answers.map((answer, index) => {
            return (
              <Grid container justify="center" key={index}>
                {/* <Downshift id="downshift-simple">
                  {({
                    getInputProps,
                    getItemProps,
                    getLabelProps,
                    getMenuProps,
                    highlightedIndex,
                    inputValue,
                    isOpen,
                    selectedItem
                  }) => {
                    const { onBlur, onFocus, ...inputProps } = getInputProps({
                      placeholder: "Enter concept answer",
                      width: 185
                    });

                    return (
                      <div>
                        {this.renderInput({
                          fullWidth: true,
                          label: "Answer",
                          InputLabelProps: getLabelProps({ shrink: true }),
                          InputProps: { onBlur, onFocus },
                          inputProps
                        })}

                        <div {...getMenuProps()}>
                          {isOpen ? (
                            <Paper square>
                              {this.getSuggestions(inputValue).map(
                                (suggestion, index) =>
                                  this.renderSuggestion({
                                    suggestion,
                                    index,
                                    itemProps: getItemProps({
                                      item: suggestion.label
                                    }),
                                    highlightedIndex,
                                    selectedItem
                                  })
                              )}
                            </Paper>
                          ) : null}
                        </div>
                      </div>
                    );
                  }}
                </Downshift> */}

                <FormControl>
                  <TextField
                    required
                    type="string"
                    id="answer"
                    label="Answer"
                    placeholder="Enter a answer"
                    style={{ width: 185 }}
                    onChange={e => this.getChangeAnswer(e, index)}
                    value={answer.answer}
                  />
                </FormControl>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={answer.abnormal}
                        onChange={e => this.getChangeData(e, index)}
                        value={answer.abnormal}
                        color="primary"
                        id="abnormal"
                      />
                    }
                    label="abnormal"
                    style={{ marginTop: 15, marginLeft: 2 }}
                  />
                </FormControl>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={answer.unique}
                        onChange={e => this.getChangeData(e, index)}
                        value={answer.unique}
                        color="primary"
                        id="unique"
                      />
                    }
                    label="unique"
                    style={{ marginTop: 15 }}
                  />
                </FormControl>
                <FormControl>
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      this.removeCodedAnswer(index);
                    }}
                    style={{ marginTop: 10 }}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </FormControl>
              </Grid>
            );
          })}
        </Grid>
        <Button
          type="button"
          className={useStyles.button}
          color="primary"
          onClick={this.addCodedAnswer}
        >
          Add New Answer
        </Button>
      </>
    );
  }
}

export default CodedDataType;
