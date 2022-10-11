import React, { Fragment } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Input,
  InputLabel,
  Paper,
  Select
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import MuiFormControl from "@material-ui/core/FormControl";
import AutoSuggestSingleSelection from "./AutoSuggestSingleSelection";
import InlineConcept from "./InlineConcept";

import MenuItem from "@material-ui/core/MenuItem";
import _, { capitalize, get, includes, isEqual, replace, toNumber } from "lodash";
import TextField from "@material-ui/core/TextField";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Chip from "@material-ui/core/Chip";
import { useTranslation } from "react-i18next";
import { AvniFormControl } from "../../common/components/AvniFormControl";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { pickers } from "../../common/constants";
import { FileOptions } from "./FileOptions";
import SubjectFormElementKeyValues from "./SubjectFormElementKeyValues";
import QuestionGroup from "./QuestionGroup";
import DocumentationSearch from "../../documentation/components/DocumentationSearch";
import { ColourStyle } from "./ColourStyle";

export const FormControl = withStyles({
  root: {
    paddingBottom: 10
  }
})(MuiFormControl);
const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120
  }
}));

const showPicker = (pickerType, cssClasses, props, disableFormElement) => {
  const picker = pickers.find(picker => picker.type === pickerType);
  const pickerModes = [];
  _.forEach(picker.modes, mode => {
    pickerModes.push(
      <FormControlLabel
        value={mode.id}
        control={<Radio />}
        label={mode.name}
        disabled={disableFormElement}
      />
    );
  });

  return (
    <Grid container item sm={12}>
      <AvniFormLabel style={cssClasses.label} label={picker.label} toolTipKey={picker.toolTipKey} />

      <RadioGroup
        aria-label={picker.label}
        name={picker.key}
        value={props.formElementData.keyValues[picker.key]}
        onChange={event =>
          props.handleGroupElementKeyValueChange(
            props.groupIndex,
            picker.key,
            event.target.value,
            props.index
          )
        }
        row
      >
        {pickerModes}
      </RadioGroup>
    </Grid>
  );
};

export const BackButton = props => {
  return (
    <Button
      size="small"
      variant="outlined"
      style={props.style}
      onClick={() => props.handleConceptFormLibrary(props.groupIndex, "", props.elementIndex, true)}
    >
      Cancel
    </Button>
  );
};

function FormElementDetails(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const disableFormElement = props.disableFormElement;
  const dataTypesToIgnore = props.ignoreDataTypes || [];
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

  function identifierSourceList() {
    var identifierSourceArr = [];
    _.forEach(props.identifierSources, (idSource, i) => {
      identifierSourceArr.push(<MenuItem value={idSource.value}>{idSource.label}</MenuItem>);
    });
    return identifierSourceArr;
  }

  function groupSubjectTypeList() {
    return _.map(props.groupSubjectTypes, ({ name, uuid }) => (
      <MenuItem value={uuid}>{name}</MenuItem>
    ));
  }

  function groupRoleList() {
    const selectedGroupSubjectType = _.find(
      props.groupSubjectTypes,
      ({ uuid }) => uuid === props.formElementData.keyValues.groupSubjectTypeUUID
    );
    return _.map(selectedGroupSubjectType.groupRoles, ({ role, uuid }) => (
      <MenuItem value={uuid}>{role}</MenuItem>
    ));
  }

  const renderDurationOptions = () => {
    const durations = ["years", "months", "weeks", "days", "hours", "minutes"];

    return durations.map(duration => {
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={
                props.formElementData.keyValues.durationOptions
                  ? props.formElementData.keyValues.durationOptions.includes(duration)
                  : false
              }
              value={duration}
              onChange={event =>
                props.handleGroupElementKeyValueChange(
                  props.groupIndex,
                  `${duration}`,
                  event.target.value,
                  props.index
                )
              }
            />
          }
          label={capitalize(duration)}
        />
      );
    });
  };

  return (
    <Fragment>
      <Grid container sm={12}>
        {props.formElementData.errorMessage && props.formElementData.errorMessage.name && (
          <div style={{ color: "red" }}>Please enter name</div>
        )}
        {get(props.formElementData, "errorMessage.ruleError") && (
          <div style={{ color: "red" }}>Please check the rule validation errors</div>
        )}
        <FormControl fullWidth>
          <AvniFormLabel label={t("Question")} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_NAME"} />
          <Input
            id="elementNameDetails"
            value={props.formElementData.name}
            onChange={event =>
              props.handleGroupElementChange(
                props.groupIndex,
                "name",
                replace(event.target.value, "|", ""),
                props.index
              )
            }
            disabled={disableFormElement}
          />
        </FormControl>
        <Paper style={{ width: "100%", marginBottom: "15px" }}>
          <div
            position="static"
            style={{ backgroundColor: "#2a96f3", color: "white", height: "30px" }}
          >
            <span style={{ marginLeft: "10px", marginTop: "15px", fontSize: "small" }}>
              CONCEPT
            </span>
          </div>
          {props.formElementData.showConceptLibrary === "" && (
            <div
              style={{
                marginLeft: "15px",
                marginRight: "15px",
                marginTop: "15px",
                marginBottom: "15px"
              }}
            >
              <Button
                color="primary"
                type="button"
                onClick={event =>
                  props.handleConceptFormLibrary(props.groupIndex, "chooseFromLibrary", props.index)
                }
                disabled={disableFormElement}
              >
                Select from library
              </Button>
              <br />
              OR
              <br />
              <Button
                color="primary"
                type="button"
                onClick={event =>
                  props.handleConceptFormLibrary(props.groupIndex, "addNewConcept", props.index)
                }
                disabled={disableFormElement}
              >
                Create new
              </Button>
            </div>
          )}
          {props.formElementData.showConceptLibrary === "addNewConcept" && (
            <div
              style={{
                marginLeft: "15px",
                marginRight: "15px",
                marginTop: "15px",
                marginBottom: "15px"
              }}
            >
              <InlineConcept
                onSaveInlineConcept={props.onSaveInlineConcept}
                formElementData={props.formElementData}
                index={props.index}
                groupIndex={props.groupIndex}
                handleGroupElementChange={props.handleGroupElementChange}
                handleInlineNumericAttributes={props.handleInlineNumericAttributes}
                handleInlineCodedConceptAnswers={props.handleInlineCodedConceptAnswers}
                onToggleInlineConceptCodedAnswerAttribute={
                  props.onToggleInlineConceptCodedAnswerAttribute
                }
                onDeleteInlineConceptCodedAnswerDelete={
                  props.onDeleteInlineConceptCodedAnswerDelete
                }
                onMoveUp={props.onMoveUp}
                onMoveDown={props.onMoveDown}
                onAlphabeticalSort={props.onAlphabeticalSort}
                handleInlineCodedAnswerAddition={props.handleInlineCodedAnswerAddition}
                handleInlineLocationAttributes={props.handleInlineLocationAttributes}
                handleInlineSubjectAttributes={props.handleInlineSubjectAttributes}
                handleInlineEncounterAttributes={props.handleInlineEncounterAttributes}
                handleInlinePhoneNumberAttributes={props.handleInlinePhoneNumberAttributes}
                handleConceptFormLibrary={props.handleConceptFormLibrary}
                dataTypesToIgnore={dataTypesToIgnore}
              />
            </div>
          )}
          {props.formElementData.showConceptLibrary === "chooseFromLibrary" && (
            <div
              style={{
                marginLeft: "15px",
                marginRight: "15px",
                marginTop: "15px",
                marginBottom: "15px"
              }}
            >
              {" "}
              <Grid item sm={12}>
                {props.formElementData.errorMessage &&
                  props.formElementData.errorMessage.concept && (
                    <div style={{ color: "red" }}>Please enter concept </div>
                  )}

                <FormControl fullWidth>
                  {props.formElementData.newFlag && (
                    <AutoSuggestSingleSelection
                      visibility={!props.formElementData.newFlag}
                      showAnswer={props.formElementData.concept}
                      onChangeAnswerName={onChangeAnswerName}
                      finalReturn={true}
                      index={0}
                      label="Concept"
                      dataTypesToIgnore={dataTypesToIgnore}
                    />
                  )}
                  {!props.formElementData.newFlag && (
                    <>
                      <FormLabel style={{ fontSize: "13px" }}>Concept*</FormLabel>
                      {disableFormElement ? (
                        props.formElementData.concept.name
                      ) : (
                        <a
                          href={`#/appDesigner/concept/${props.formElementData.concept.uuid}/show`}
                        >
                          {props.formElementData.concept.name}
                        </a>
                      )}
                    </>
                  )}
                </FormControl>
              </Grid>
              {props.formElementData.concept.dataType !== "Coded" && <Grid item sm={6} />}
              {props.formElementData.concept.dataType === "Numeric" && (
                <Grid container item sm={12}>
                  <Grid item sm={2}>
                    <FormControl>
                      <AvniFormLabel
                        label={"Low Absolute"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_LOW_ABSOLUTE"}
                      />
                      <Input
                        disableUnderline={true}
                        value={
                          props.formElementData.concept.lowAbsolute
                            ? props.formElementData.concept.lowAbsolute
                            : "N.A"
                        }
                        disabled
                      />
                    </FormControl>
                  </Grid>
                  <Grid item sm={2}>
                    <FormControl>
                      <AvniFormLabel
                        label={"High Absolute"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_HIGH_ABSOLUTE"}
                      />
                      <Input
                        disableUnderline={true}
                        value={
                          props.formElementData.concept.highAbsolute
                            ? props.formElementData.concept.highAbsolute
                            : "N.A"
                        }
                        disabled
                      />
                    </FormControl>
                  </Grid>
                  <Grid item sm={2}>
                    <FormControl>
                      <AvniFormLabel
                        label={"Low normal"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_LOW_NORMAL"}
                      />
                      <Input
                        disableUnderline={true}
                        value={
                          props.formElementData.concept.lowNormal
                            ? props.formElementData.concept.lowNormal
                            : "N.A"
                        }
                        disabled
                      />
                    </FormControl>
                  </Grid>
                  <Grid item sm={2}>
                    <FormControl>
                      <AvniFormLabel
                        label={"High normal"}
                        toolTipKey={"APP_DESIGNER_FORM_ELEMENT_HIGH_NORMAL"}
                      />
                      <Input
                        disableUnderline={true}
                        value={
                          props.formElementData.concept.highNormal
                            ? props.formElementData.concept.highNormal
                            : "N.A"
                        }
                        disabled
                      />
                    </FormControl>
                  </Grid>
                  <Grid item sm={2}>
                    <FormControl>
                      <AvniFormLabel label={"Unit"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_UNIT"} />
                      <Input
                        disableUnderline={true}
                        value={
                          props.formElementData.concept.unit
                            ? props.formElementData.concept.unit
                            : "N.A"
                        }
                        disabled
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              )}
              {props.formElementData.concept.dataType === "Coded" && (
                <>
                  <Grid container item sm={12}>
                    <InputLabel style={{ paddingTop: 10 }}>Answers:</InputLabel>{" "}
                    {_.orderBy(props.formElementData.concept.answers, "order").map(function(d) {
                      if (!d.excluded && !d.voided) {
                        return (
                          <Chip
                            key={d.name}
                            label={
                              disableFormElement ? (
                                d.name
                              ) : (
                                <a href={`#/appDesigner/concept/${d.uuid}/show`}>
                                  <span style={{ color: "black" }}>{d.name}</span>
                                </a>
                              )
                            }
                            onDelete={event =>
                              disableFormElement
                                ? _.noop()
                                : props.handleExcludedAnswers(
                                    d.name,
                                    true,
                                    props.groupIndex,
                                    props.index
                                  )
                            }
                          />
                        );
                      }
                      return "";
                    })}
                  </Grid>
                </>
              )}
              {props.formElementData.newFlag && (
                <BackButton
                  handleConceptFormLibrary={props.handleConceptFormLibrary}
                  groupIndex={props.groupIndex}
                  elementIndex={props.index}
                  style={{}}
                />
              )}
            </div>
          )}
        </Paper>
        {includes(
          ["Coded", "Subject", "Image", "Video", "File", "Encounter"],
          props.formElementData.concept.dataType
        ) && (
          <>
            <Grid item sm={6}>
              {props.formElementData.errorMessage && props.formElementData.errorMessage.type && (
                <div style={{ color: "red" }}>Please select type</div>
              )}
              <FormControl fullWidth disabled={disableFormElement}>
                <AvniFormLabel label={"Type"} toolTipKey={"APP_DESIGNER_FORM_ELEMENT_CODED_TYPE"} />
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
          </>
        )}
        <FormControl fullWidth>
          <AvniFormLabel
            label={t("Documentation")}
            toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DOCUMENTATION"}
          />
          <DocumentationSearch
            value={props.formElementData.documentation}
            onChange={documentation => {
              props.handleGroupElementChange(
                props.groupIndex,
                "documentation",
                documentation,
                props.index
              );
            }}
          />
        </FormControl>
        {props.formElementData.concept.dataType === "Coded" && (
          <>
            <br />
            <Grid container item sm={12}>
              <InputLabel style={{ paddingTop: 10 }}>Excluded Answers:</InputLabel>{" "}
              {props.formElementData.concept.answers.map(function(d) {
                if (d.excluded && !d.voided) {
                  return (
                    <Chip
                      key={d.name}
                      label={
                        disableFormElement ? (
                          d.name
                        ) : (
                          <a href={`#/appDesigner/concept/${d.uuid}/show`}>
                            <span style={{ color: "black" }}>{d.name}</span>
                          </a>
                        )
                      }
                      onDelete={event =>
                        disableFormElement
                          ? _.noop()
                          : props.handleExcludedAnswers(
                              d.name,
                              false,
                              props.groupIndex,
                              props.index
                            )
                      }
                    />
                  );
                }
                return "";
              })}
            </Grid>
          </>
        )}

        {props.formElementData.concept.dataType === "Video" && (
          <Grid container item sm={12}>
            <Grid item sm={4}>
              <TextField
                type="number"
                name="durationLimitInSecs"
                label="Duration limit(seconds)"
                placeholder="60"
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
                disabled={disableFormElement}
              />
              {props.formElementData.errorMessage &&
                props.formElementData.errorMessage.durationLimitInSecs && (
                  <div style={{ color: "red" }}>Please enter positive number</div>
                )}
            </Grid>
            <Grid item sm={1} />
            <Grid item sm={3}>
              <FormControl className={classes.formControl} disabled={disableFormElement}>
                <AvniFormLabel
                  label={"Video Quality"}
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_VIDEO_QUALITY"}
                />
                <Select
                  name="videoQuality"
                  classes={cssClasses.dropDown}
                  value={
                    props.formElementData.keyValues.videoQuality === undefined
                      ? "high"
                      : props.formElementData.keyValues.videoQuality
                  }
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
        {props.formElementData.concept.dataType === "File" && (
          <FileOptions
            keyValues={props.formElementData.keyValues}
            handleChange={props.handleGroupElementKeyValueChange}
            groupIndex={props.groupIndex}
            index={props.index}
          />
        )}
        {props.formElementData.concept.dataType === "Image" && (
          <Grid container item sm={12}>
            <Grid item sm={3}>
              <TextField
                name="maxHeight"
                type="number"
                label="Max Height"
                placeholder="960"
                value={props.formElementData.keyValues.maxHeight}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "maxHeight",
                    toNumber(event.target.value),
                    props.index
                  )
                }
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                disabled={disableFormElement}
              />
              {props.formElementData.errorMessage &&
                props.formElementData.errorMessage.maxHeight && (
                  <div style={{ color: "red" }}>Please enter positive number</div>
                )}
            </Grid>
            <Grid item sm={1} />
            <Grid item sm={3}>
              <TextField
                type="number"
                name="maxWidth"
                label="Max Width"
                placeholder="1280"
                value={props.formElementData.keyValues.maxWidth}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "maxWidth",
                    toNumber(event.target.value),
                    props.index
                  )
                }
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                disabled={disableFormElement}
              />
              {props.formElementData.errorMessage &&
                props.formElementData.errorMessage.maxWidth && (
                  <div style={{ color: "red" }}>Please enter positive number</div>
                )}
            </Grid>
            <Grid item sm={1} />
            <Grid item sm={3}>
              <FormControl className={classes.formControl} disabled={disableFormElement}>
                <AvniFormLabel
                  label={"Image Quality"}
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_IMAGE_QUALITY"}
                />
                <Select
                  name="imageQuality"
                  value={
                    props.formElementData.keyValues.imageQuality === undefined
                      ? 1
                      : props.formElementData.keyValues.imageQuality
                  }
                  onChange={event =>
                    props.handleGroupElementKeyValueChange(
                      props.groupIndex,
                      "imageQuality",
                      toNumber(event.target.value),
                      props.index
                    )
                  }
                >
                  <MenuItem value="0">Low</MenuItem>
                  <MenuItem value="1">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {props.formElementData.concept.dataType === "Date" &&
          showPicker("date", cssClasses, props, disableFormElement)}

        {["Date", "Duration"].includes(props.formElementData.concept.dataType) && (
          <Grid container item sm={12}>
            <AvniFormLabel
              style={cssClasses.label}
              label={"Duration Options"}
              toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DURATION_OPTIONS"}
            />

            <FormControl component="fieldset" disabled={disableFormElement}>
              <FormGroup row>{renderDurationOptions()}</FormGroup>
            </FormControl>
          </Grid>
        )}

        {props.formElementData.concept.dataType === "DateTime" &&
          showPicker("date", cssClasses, props, disableFormElement)}

        {props.formElementData.concept.dataType === "Time" &&
          showPicker("time", cssClasses, props, disableFormElement)}

        {["Numeric", "Text"].includes(props.formElementData.concept.dataType) && (
          <Grid item sm={12}>
            {props.formElementData.errorMessage &&
              props.formElementData.errorMessage.validFormat && (
                <div style={{ color: "red" }}>
                  {" "}
                  Validation Regex and description key both must be empty or both must be filled
                </div>
              )}
            <FormControl fullWidth disabled={disableFormElement}>
              <AvniFormLabel
                label={"Validation Regex"}
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_VALIDATION_REGEX"}
              />
              <Input
                id="validFormatRegex"
                value={get(props.formElementData, "validFormat.regex", "")}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "regex",
                    event.target.value,
                    props.index
                  )
                }
              />
            </FormControl>
            <FormControl fullWidth disabled={disableFormElement}>
              <AvniFormLabel
                label={"Validation Description Key"}
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_VALIDATION_DESCRIPTION_KEY"}
              />
              <Input
                id="validFormatDescriptionKey"
                value={get(props.formElementData, "validFormat.descriptionKey", "")}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "descriptionKey",
                    event.target.value,
                    props.index
                  )
                }
              />
            </FormControl>
          </Grid>
        )}
        <Grid container item sm={12}>
          {props.formElementData.concept.dataType !== "QuestionGroup" && (
            <Grid item sm={4}>
              <AvniFormControl
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_MANDATORY"}
                disabled={disableFormElement}
              >
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
              </AvniFormControl>
            </Grid>
          )}
          {props.formElementData.concept.dataType === "Subject" && (
            <SubjectFormElementKeyValues {...props} />
          )}
          <Grid item sm={4}>
            {["Numeric", "Text", "Date", "DateTime", "Time", "Coded"].includes(
              props.formElementData.concept.dataType
            ) && (
              <AvniFormControl
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_READ_ONLY"}
                disabled={disableFormElement}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      id="editable"
                      checked={
                        typeof props.formElementData.keyValues.editable === "undefined"
                          ? false
                          : true
                      }
                      onChange={event =>
                        props.handleGroupElementKeyValueChange(
                          props.groupIndex,
                          "editable",
                          typeof props.formElementData.keyValues.editable,
                          props.index
                        )
                      }
                    />
                  }
                  label="Read Only"
                />
              </AvniFormControl>
            )}
          </Grid>
          {["Numeric", "Text", "PhoneNumber"].includes(props.formElementData.concept.dataType) && (
            <Grid item sm={4}>
              <AvniFormControl
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_UNIQUE"}
                disabled={disableFormElement}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      id="unique"
                      checked={!!props.formElementData.keyValues.unique}
                      onChange={event =>
                        props.handleGroupElementKeyValueChange(
                          props.groupIndex,
                          "unique",
                          event.target.checked,
                          props.index
                        )
                      }
                    />
                  }
                  label="Unique"
                />
              </AvniFormControl>
            </Grid>
          )}
        </Grid>
        {props.formElementData.concept.dataType === "Id" && (
          <Grid item sm={6}>
            <FormControl fullWidth disabled={disableFormElement}>
              <AvniFormLabel
                label={"Identifier Source"}
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_IDENTIFIER_SOURCE"}
              />
              <Select
                name="identifierSource"
                value={props.formElementData.keyValues.IdSourceUUID}
                onChange={event =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "IdSourceUUID",
                    event.target.value,
                    props.index
                  )
                }
                required
              >
                {identifierSourceList()}
              </Select>
            </FormControl>
          </Grid>
        )}
        {props.formElementData.concept.dataType === "GroupAffiliation" && (
          <Grid item container spacing={5}>
            <Grid item sm={6}>
              <FormControl fullWidth disabled={disableFormElement}>
                <AvniFormLabel
                  label={"Group Subject Type"}
                  toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_SUBJECT_TYPE"}
                />
                <Select
                  name="groupSubjectType"
                  value={props.formElementData.keyValues.groupSubjectTypeUUID}
                  onChange={event =>
                    props.handleGroupElementKeyValueChange(
                      props.groupIndex,
                      "groupSubjectTypeUUID",
                      event.target.value,
                      props.index
                    )
                  }
                  required
                >
                  {groupSubjectTypeList()}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={6}>
              {props.formElementData.keyValues.groupSubjectTypeUUID && (
                <FormControl fullWidth disabled={disableFormElement}>
                  <AvniFormLabel
                    label={"Group Role"}
                    toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_ROLE"}
                  />
                  <Select
                    name="groupSubjectRole"
                    value={props.formElementData.keyValues.groupSubjectRoleUUID}
                    onChange={event =>
                      props.handleGroupElementKeyValueChange(
                        props.groupIndex,
                        "groupSubjectRoleUUID",
                        event.target.value,
                        props.index
                      )
                    }
                    required
                  >
                    {groupRoleList()}
                  </Select>
                </FormControl>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
      {props.formElementData.concept.dataType === "QuestionGroup" && (
        <Fragment>
          <QuestionGroup parentFormElementUUID={props.formElementData.uuid} {...props} />
          <Grid container direction={"row"} spacing={10}>
            <Grid item>
              <AvniFormControl toolTipKey={"APP_DESIGNER_FORM_ELEMENT_REPEATABLE"}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="repeatable"
                      checked={!!props.formElementData.keyValues.repeatable}
                      onChange={event =>
                        props.handleGroupElementKeyValueChange(
                          props.groupIndex,
                          "repeatable",
                          event.target.checked,
                          props.index
                        )
                      }
                    />
                  }
                  label="Repeatable"
                />
              </AvniFormControl>
            </Grid>
            <Grid item>
              <AvniFormControl toolTipKey={"APP_DESIGNER_FORM_ELEMENT_DISABLE_MANUAL_ACTIONS"}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="disableManualActions"
                      checked={!!props.formElementData.keyValues.disableManualActions}
                      onChange={event =>
                        props.handleGroupElementKeyValueChange(
                          props.groupIndex,
                          "disableManualActions",
                          event.target.checked,
                          props.index
                        )
                      }
                    />
                  }
                  label="Disable manual addition and removal"
                />
              </AvniFormControl>
            </Grid>
            <Grid item>
              <ColourStyle
                label={"Text colour"}
                colour={props.formElementData.keyValues.textColour}
                onChange={colour =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "textColour",
                    colour,
                    props.index
                  )
                }
                toolTipKey={"APP_DESIGNER_GROUP_TEXT_COLOUR"}
              />
            </Grid>
            <Grid item>
              <ColourStyle
                label={"Background colour"}
                colour={props.formElementData.keyValues.backgroundColour}
                onChange={colour =>
                  props.handleGroupElementKeyValueChange(
                    props.groupIndex,
                    "backgroundColour",
                    colour,
                    props.index
                  )
                }
                toolTipKey={"APP_DESIGNER_GROUP_BACKGROUND_COLOUR"}
              />
            </Grid>
          </Grid>
        </Fragment>
      )}
    </Fragment>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default React.memo(FormElementDetails, areEqual);
