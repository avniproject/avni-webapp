import React from "react";
import { Input, InputLabel, Checkbox, FormControlLabel, Select } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import MuiFormControl from "@material-ui/core/FormControl";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import MenuItem from "@material-ui/core/MenuItem";
import { isEqual } from "lodash";

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
    borderRadius: 15,
    marginBottom: 5
  }
}));

function FormElementDetails(props) {
  const classes = useStyles();

  function onChangeAnswerName(answerName, index, flag = true) {
    if (flag) {
      props.handleGroupElementChange(props.groupIndex, "concept", answerName, props.index);
      if (props.formElementData.name === "") {
        props.handleGroupElementChange(props.groupIndex, "name", answerName.name, props.index);
      }
    } else {
      props.updateConceptElementData(props.groupIndex, "name", answerName, props.index);
    }
  }

  return (
    <Grid container item sm={12}>
      <Grid item sm={12}>
        {props.formElementData.errorMessage &&
          (props.formElementData.errorMessage.name && (
            <div style={{ color: "red" }}>Please enter name</div>
          ))}
        <FormControl fullWidth>
          <InputLabel htmlFor="elementNameDetails">Name</InputLabel>
          <Input
            id="elementNameDetails"
            value={props.formElementData.name}
            onChange={event =>
              props.handleGroupElementChange(
                props.groupIndex,
                "name",
                event.target.value,
                props.index
              )
            }
          />
        </FormControl>
      </Grid>
      <Grid item sm={12}>
        {props.formElementData.errorMessage &&
          (props.formElementData.errorMessage.concept && (
            <div style={{ color: "red" }}>Please enter concept </div>
          ))}

        <FormControl fullWidth>
          <AutoSuggestSingleSelection
            visibility={!props.formElementData.newFlag}
            showAnswer={props.formElementData.concept}
            onChangeAnswerName={onChangeAnswerName}
            finalReturn={true}
            index={0}
            label="Concept"
          />
        </FormControl>
      </Grid>
      {props.formElementData.concept.dataType === "Coded" && (
        <Grid item sm={6}>
          {props.formElementData.errorMessage &&
            (props.formElementData.errorMessage.type && (
              <div style={{ color: "red" }}>Please select type</div>
            ))}
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={props.formElementData.type}
              onChange={event =>
                props.handleGroupElementChange(
                  props.groupIndex,
                  "type",
                  event.target.value,
                  props.index
                )
              }
              required
            >
              <MenuItem value="SingleSelect">SingleSelect</MenuItem>
              <MenuItem value="MultiSelect">MultiSelect</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      {props.formElementData.concept.dataType !== "Coded" && <Grid item sm={6} />}

      {props.formElementData.concept.dataType === "Numeric" && (
        <Grid container item sm={12}>
          <Grid item sm={2}>
            <FormControl>
              <InputLabel>Low Absolute</InputLabel>
              <Input
                disableUnderline={true}
                value={props.formElementData.concept.lowAbsolute}
                disabled
              />
            </FormControl>
          </Grid>
          <Grid item sm={2}>
            <FormControl>
              <InputLabel>High Absolute</InputLabel>
              <Input
                disableUnderline={true}
                value={props.formElementData.concept.highAbsolute}
                disabled
              />
            </FormControl>
          </Grid>
          <Grid item sm={2}>
            <FormControl>
              <InputLabel>Low normal</InputLabel>
              <Input
                disableUnderline={true}
                value={props.formElementData.concept.lowNormal}
                disabled
              />
            </FormControl>
          </Grid>
          <Grid item sm={2}>
            <FormControl>
              <InputLabel>High normal</InputLabel>
              <Input
                disableUnderline={true}
                value={props.formElementData.concept.highNormal}
                disabled
              />
            </FormControl>
          </Grid>
          <Grid item sm={2}>
            <FormControl>
              <InputLabel>Unit</InputLabel>
              <Input disableUnderline={true} value={props.formElementData.concept.unit} disabled />
            </FormControl>
          </Grid>
        </Grid>
      )}
      {props.formElementData.concept.dataType === "Coded" && (
        <Grid container item sm={12}>
          <InputLabel style={{ paddingTop: 10 }}>Answers:</InputLabel>{" "}
          {props.formElementData.concept.answers.map(function(d) {
            if (!d.voided) {
              return (
                <div key={d.name} className={classes.answers}>
                  {" "}
                  {d.name}{" "}
                </div>
              );
            }
            return "";
          })}
        </Grid>
      )}
      <Grid item sm={12}>
        <FormControlLabel
          control={
            <Checkbox
              id="mandatoryDetails"
              checked={props.formElementData.mandatory}
              value={props.formElementData.mandatory ? "yes" : "no"}
              onChange={event =>
                props.handleGroupElementChange(
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

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default React.memo(FormElementDetails, areEqual);
