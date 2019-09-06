import React from "react";
import { Input, InputLabel, Checkbox, FormControlLabel } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import MuiFormControl from "@material-ui/core/FormControl";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";

const FormControl = withStyles({
  root: {
    paddingBottom: 10
  }
})(MuiFormControl);

const useStyles = makeStyles(theme => ({
  answers: {
    padding: "5px 10px 5px 10px",
    backgroundColor: "#bcbcbc",
    marginLeft: 10,
    borderRadius: 15
  }
}));

function onChangeAnswerName(answerName, index) {
  console.log("onChangeAnswerName");
}

export default function FormElementDetails(props) {
  const classes = useStyles();

  return (
    <Grid container item sm={12}>
      <Grid item sm={6}>
        <FormControl fullWidth>
          <InputLabel htmlFor="elementNameDetails">Name</InputLabel>
          <Input
            id="elementNameDetails"
            value={props.formElementData.name}
            onChange={event =>
              props.updateElementData(props.groupIndex, "name", event.target.value, props.index)
            }
          />
        </FormControl>
      </Grid>
      <Grid item sm={6} />
      <Grid item sm={6}>
        <FormControl fullWidth>
          <AutoSuggestSingleSelection
            visibility={false}
            showAnswer={props.formElementData.concept.name}
            onChangeAnswerName={onChangeAnswerName}
            index={0}
            label="Concept"
          />
        </FormControl>
      </Grid>
      <Grid item sm={6} />

      {props.formElementData.concept.dataType === "Numeric" && (
        <Grid container item sm={12}>
          <Grid item sm={3}>
            <FormControl>
              <InputLabel>Low Absolute</InputLabel>
              <Input
                disableUnderline={true}
                value={props.formElementData.concept.lowAbsolute}
                disabled
              />
            </FormControl>
          </Grid>
          <Grid item sm={3}>
            <FormControl>
              <InputLabel>High Absolute</InputLabel>
              <Input
                disableUnderline={true}
                value={props.formElementData.concept.highAbsolute}
                disabled
              />
            </FormControl>
          </Grid>
          <Grid item sm={3}>
            <FormControl>
              <InputLabel>Low normal</InputLabel>
              <Input
                disableUnderline={true}
                value={props.formElementData.concept.lowNormal}
                disabled
              />
            </FormControl>
          </Grid>
          <Grid item sm={3}>
            <FormControl>
              <InputLabel>High normal</InputLabel>
              <Input
                disableUnderline={true}
                value={props.formElementData.concept.highNormal}
                disabled
              />
            </FormControl>
          </Grid>
        </Grid>
      )}
      {props.formElementData.concept.dataType === "Coded" && (
        <Grid container item sm={12}>
          <InputLabel style={{ paddingTop: 10 }}>Answers:</InputLabel>{" "}
          {props.formElementData.concept.answers.map(function(d) {
            return <div className={classes.answers}> {d.name} </div>;
          })}
        </Grid>
      )}
      <Grid item sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              id="mandatoryDetails"
              checked={props.formElementData.mandatory}
              value={props.formElementData.mandatory ? "yes" : "no"}
              onChange={event =>
                props.updateElementData(
                  props.groupIndex,
                  "mandatory",
                  event.target.value === "yes" ? false : true,
                  props.index
                )
              }
            />
          }
          label="Mandatory"
        />
      </Grid>
    </Grid>
  );
}
