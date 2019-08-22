import React, { Component } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";

class CodedDataType extends Component {
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
        <Grid container style={{ marginTop: 20 }}>
          {this.props.answers.map((answer, index) => {
            return (
              !answer.voided && (
                <Grid container key={index}>
                  <FormControl>
                    <AutoSuggestSingleSelection
                      visibility={!answer.editable}
                      showAnswer={answer.name}
                      onChangeAnswerName={this.props.onChangeAnswerName}
                      index={index}
                    />
                  </FormControl>
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={answer.abnormal}
                          onChange={e => this.props.onToggleAnswerField(e, index)}
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
                          onChange={e => this.props.onToggleAnswerField(e, index)}
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
                        this.props.onDeleteAnswer(index);
                      }}
                      style={{ marginTop: 10 }}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </FormControl>
                </Grid>
              )
            );
          })}
        </Grid>
        <Button
          type="button"
          className={useStyles.button}
          color="primary"
          onClick={this.props.onAddAnswer}
        >
          Add New Answer
        </Button>
      </>
    );
  }
}

export default CodedDataType;
