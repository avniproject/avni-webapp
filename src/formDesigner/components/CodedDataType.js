import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

class CodedDataType extends Component {
  constructor() {
    super();
    this.state = {
      flag: true,
      answers: [{ answer: "", uuid: "", unique: false, abnormal: false }]
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
    const ans = [...this.state.answers];
    ans[index].answer = event.target.value;
    this.setState(
      {
        answers: ans
      },
      () => {
        console.log(this.state.answers);
      }
    );
  };

  addCodedAnswer = () => {
    this.setState({
      answers: [
        ...this.state.answers,
        { answer: "", uuid: "", unique: false, abnormal: false }
      ]
    });
  };
  removeCodedAnswer = index => {
    console.log(index);
    const tempAnswers = this.state.answers;
    tempAnswers.splice(index, 1);
    tempAnswers.indexOf(tempAnswers[index], 1);
    this.setState(
      {
        answers: tempAnswers
      },
      () => {
        console.log(this.state.answers);
      }
    );
  };

  render() {
    return (
      <>
        <Grid container justify="center" onChange={this.handleChange}>
          {this.state.answers.map((name, index) => {
            return (
              <Box borderColor="primary.main" clone>
                <div key={index}>
                  <TextField
                    type="string"
                    id="answer"
                    label="Answer"
                    placeholder="Enter a answer"
                    margin="normal"
                    onChange={e => this.getChangeAnswer(e, index)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={name.abnormal}
                        onChange={e => this.getChangeData(e, index)}
                        value={name.abnormal}
                        color="primary"
                        id="abnormal"
                      />
                    }
                    label="abnormal"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={name.unique}
                        onChange={e => this.getChangeData(e, index)}
                        value={name.unique}
                        color="primary"
                        id="unique"
                      />
                    }
                    label="unique"
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    onClick={() => this.removeCodedAnswer(index)}
                  >
                    Remove
                  </Button>
                </div>
              </Box>
            );
          })}
        </Grid>
        <Button
          type="button"
          variant="outlined"
          color="primary"
          onClick={this.addCodedAnswer}
        >
          Add
        </Button>
      </>
    );
  }
}

export default CodedDataType;
