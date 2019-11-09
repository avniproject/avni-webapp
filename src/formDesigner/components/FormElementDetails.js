import React from "react";
import {
  Input,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Select,
  FormGroup
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import MuiFormControl from "@material-ui/core/FormControl";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import MenuItem from "@material-ui/core/MenuItem";
import { isEqual } from "lodash";
import TextField from "@material-ui/core/TextField";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Chip from "@material-ui/core/Chip";

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
  const cssClasses = {
    label: {
      marginTop: 13,
      marginRight: 10,
      color: "black"
    },
    dropDown: {
      width: 100
    },
    labelWidth: {
      width: 100,
      marginTop: "30%"
    }
  };
  // const [show, onShow] = React.useState(true);

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

  // const onShowDialogueForConcept = () => {
  //   return (
  //     <Dialog open={show} aria-labelledby="form-dialog-title">
  //       <DialogTitle id="form-dialog-title">Create Concept</DialogTitle>
  //       <DialogContent dividers>
  //       <CreateEditConcept isCreatePage={true} enableLeftMenuButton={false} />
  //       </DialogContent>
  //       <DialogActions><Button color="primary">Cancel</Button></DialogActions>
  //     </Dialog>
  //   );
  // };

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
      {/* <Grid item sm={1} /> */}
      {/* <Grid item sm={2}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          style={{ marginTop: "5%", outline: "none" }}
          onClick={onShowDialogueForConcept}
        >
          + Concept
        </Button>
      </Grid> */}
      {/* {show && onShowDialogueForConcept()} */}
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
      {props.formElementData.concept.dataType === "Video" && (
        <Grid container item sm={12}>
          <Grid item sm={3}>
            <TextField
              type="number"
              name="durationLimitInSecs"
              label="Duration limit (seconds)"
              value={props.formElementData.keyValues.durationLimitInSecs}
              onChange={event =>
                props.handleGroupElementKeyValueChange(
                  props.groupIndex,
                  "durationLimitInSecs",
                  event.target.value,
                  props.index
                )
              }
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item sm={1} />
          <Grid item sm={3}>
            <FormControl>
              <InputLabel style={cssClasses.labelWidth}>Video Quality</InputLabel>
              <Select
                style={{ marginTop: "55%" }}
                name="videoQuality"
                classes={cssClasses.dropDown}
                value={props.formElementData.keyValues.videoQuality}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "videoQuality",
                    event.target.value,
                    props.index
                  )
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      {props.formElementData.concept.dataType === "Image" && (
        <Grid container item sm={12}>
          <Grid item sm={3}>
            <TextField
              name="maxHeight"
              type="number"
              label="Max Height"
              value={props.formElementData.keyValues.maxHeight}
              onChange={event =>
                props.handleGroupElementKeyValueChange(
                  props.groupIndex,
                  "maxHeight",
                  event.target.value,
                  props.index
                )
              }
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item sm={1} />
          <Grid item sm={3}>
            <TextField
              type="number"
              name="maxWidth"
              label="Max Width"
              value={props.formElementData.keyValues.maxWidth}
              onChange={event =>
                props.handleGroupElementKeyValueChange(
                  props.groupIndex,
                  "maxWidth",
                  event.target.value,
                  props.index
                )
              }
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item sm={1} />
          <Grid item sm={3}>
            <FormControl>
              <InputLabel style={cssClasses.labelWidth}>Image Quality</InputLabel>
              <Select
                style={{ marginTop: "55%" }}
                name="imageQuality"
                value={props.formElementData.keyValues.imageQuality}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "imageQuality",
                    event.target.value,
                    props.index
                  )
                }
              >
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="1">1</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      {["Date", "Duration"].includes(props.formElementData.concept.dataType) && (
        <Grid container item sm={12}>
          <InputLabel style={cssClasses.label}> Duration Options</InputLabel>
          <FormControl component="fieldset">
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      props.formElementData.keyValues.durationOptions
                        ? props.formElementData.keyValues.durationOptions.includes("years")
                        : false
                    }
                    value="years"
                    onChange={event =>
                      props.handleGroupElementKeyValueChange(
                        props.groupIndex,
                        "years",
                        event.target.value,
                        props.index
                      )
                    }
                  />
                }
                label="Years"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      props.formElementData.keyValues.durationOptions
                        ? props.formElementData.keyValues.durationOptions.includes("months")
                        : false
                    }
                    value="months"
                    onChange={event =>
                      props.handleGroupElementKeyValueChange(
                        props.groupIndex,
                        "months",
                        event.target.value,
                        props.index
                      )
                    }
                  />
                }
                label="Months"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      props.formElementData.keyValues.durationOptions
                        ? props.formElementData.keyValues.durationOptions.includes("weeks")
                        : false
                    }
                    value="weeks"
                    onChange={event =>
                      props.handleGroupElementKeyValueChange(
                        props.groupIndex,
                        "weeks",
                        event.target.value,
                        props.index
                      )
                    }
                  />
                }
                label="Weeks"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      props.formElementData.keyValues.durationOptions
                        ? props.formElementData.keyValues.durationOptions.includes("days")
                        : false
                    }
                    value="days"
                    onChange={event =>
                      props.handleGroupElementKeyValueChange(
                        props.groupIndex,
                        "days",
                        event.target.value,
                        props.index
                      )
                    }
                  />
                }
                label="Days"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      props.formElementData.keyValues.durationOptions
                        ? props.formElementData.keyValues.durationOptions.includes("hours")
                        : false
                    }
                    value="hours"
                    onChange={event =>
                      props.handleGroupElementKeyValueChange(
                        props.groupIndex,
                        "hours",
                        event.target.value,
                        props.index
                      )
                    }
                  />
                }
                label="Hours"
              />
            </FormGroup>
          </FormControl>
        </Grid>
      )}
      {["Date", "DateTime"].includes(props.formElementData.concept.dataType) && (
        <Grid container item sm={12}>
          <InputLabel style={cssClasses.label}>Date Picker Mode</InputLabel>

          <RadioGroup
            aria-label="Date Picker Mode"
            name="datePickerMode"
            value={props.formElementData.keyValues.datePickerMode}
            onChange={event =>
              props.handleGroupElementKeyValueChange(
                props.groupIndex,
                "datePickerMode",
                event.target.value,
                props.index
              )
            }
            row
          >
            <FormControlLabel value="Default" control={<Radio />} label="Default" />
            <FormControlLabel value="Calender" control={<Radio />} label="Calender" />
            <FormControlLabel value="Spinner" control={<Radio />} label="Spinner" />
          </RadioGroup>
        </Grid>
      )}
      {props.formElementData.concept.dataType === "Coded" && (
        <>
          <Grid container item sm={12}>
            <InputLabel style={{ paddingTop: 10 }}>Answers:</InputLabel>{" "}
            {props.formElementData.concept.answers.map(function(d) {
              if (!d.voided) {
                return (
                  <Chip
                    key={d.name}
                    label={d.name}
                    onDelete={event =>
                      props.handleExcludedAnswers(d.name, true, props.groupIndex, props.index)
                    }
                  />
                );
              }
              return "";
            })}
          </Grid>
          <Grid container item sm={12}>
            <InputLabel style={{ paddingTop: 10 }}>Excluded Answers:</InputLabel>{" "}
            {props.formElementData.concept.answers.map(function(d) {
              if (d.voided) {
                return (
                  <Chip
                    key={d.name}
                    label={d.name}
                    onDelete={event =>
                      props.handleExcludedAnswers(d.name, false, props.groupIndex, props.index)
                    }
                  />
                );
              }
              return "";
            })}
          </Grid>
        </>
      )}

      <Grid container item sm={12}>
        <Grid item sm={6}>
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
        {["Numeric", "Text", "Date", "DateTime"].includes(
          props.formElementData.concept.dataType
        ) && (
          <Grid item sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  id="editable"
                  checked={props.formElementData.keyValues.editable}
                  onChange={event =>
                    props.handleGroupElementKeyValueChange(
                      props.groupIndex,
                      "editable",
                      props.formElementData.keyValues.editable,
                      props.index
                    )
                  }
                />
              }
              label="Editable"
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default React.memo(FormElementDetails, areEqual);
