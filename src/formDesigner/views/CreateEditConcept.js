import React, { Component } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import http from "common/utils/httpClient";
import NumericConcept from "../components/NumericConcept";
import CodedConcept from "../components/CodedConcept";
import { LocationConcept } from "../components/LocationConcept";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import KeyValues from "../components/KeyValues";
import { filter, find, replace, sortBy, toLower, trim } from "lodash";
import { SaveComponent } from "../../common/components/SaveComponent";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniTextField } from "../../common/components/AvniTextField";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { Redirect } from "react-router-dom";
import VisibilityIcon from "@material-ui/icons/Visibility";
import DeleteIcon from "@material-ui/icons/Delete";
import { ConceptActiveSwitch } from "../components/ConceptActiveSwitch";
import { SubjectConcept } from "../components/SubjectConcept";
import { PhoneNumberConcept } from "../components/PhoneNumberConcept";
import { EncounterConcept } from "../components/EncounterConcept";
import { connect } from "react-redux";
import { ImageV2Concept } from "../components/ImageV2Concept";
import { AvniImageUpload } from "../../common/components/AvniImageUpload";
import ConceptService from "../../common/service/ConceptService";
import { ConceptAnswerError, WebConcept, WebConceptAnswerView, WebConceptView } from "../../common/model/WebConcept";

export const moveUp = (conceptAnswers, index) => {
  if (index === 0) return conceptAnswers;
  const answers = [...conceptAnswers];
  const answer = answers[index];
  answers[index] = answers[index - 1];
  answers[index - 1] = answer;
  return answers;
};

export const moveDown = (conceptAnswers, index) => {
  if (index === conceptAnswers.length - 1) return conceptAnswers;
  const answers = [...conceptAnswers];
  const answer = answers[index];
  answers[index] = answers[index + 1];
  answers[index + 1] = answer;
  return answers;
};

export const alphabeticalSort = conceptAnswers => {
  return sortBy([...conceptAnswers], ans => toLower(ans.name));
};

export const validateCodedConceptAnswers = answers => {
  resetAnswerErrorState(answers);
  checkForEmptyAnswerNames(answers);
  checkForDuplicateAnswers(answers);
};

const resetAnswerErrorState = answers => {
  answers.forEach(answer => {
    answer["isAnswerHavingError"] = { isErrored: false, type: "" };
  });
};

const checkForEmptyAnswerNames = answers => {
  answers
    .filter(answer => answer.name.trim() === "")
    .forEach(answer => {
      answer["isAnswerHavingError"] = ConceptAnswerError.inError("required");
    });
};

const checkForDuplicateAnswers = answers => {
  const uniqueCodedAnswerNames = new Set();
  answers
    .filter(answer => answer && !answer.voided)
    .forEach(answer => {
      if (uniqueCodedAnswerNames.size === uniqueCodedAnswerNames.add(answer.name).size) {
        answer.isAnswerHavingError = ConceptAnswerError.inError("duplicate");
      }
    });
};

class CreateEditConcept extends Component {
  constructor(props) {
    super(props);
    const emptyConcept = WebConceptView.emptyConcept();
    this.state = {
      concept: emptyConcept,
      conceptCreationAlert: false,
      error: {},
      dataTypes: [],
      defaultSnackbarStatus: true,
      redirectShow: false,
      redirectOnDeleteOrCreate: false,
      active: false,
      readOnlyKeys: [
        "isWithinCatchment",
        "lowestAddressLevelTypeUUIDs",
        "highestAddressLevelTypeUUID",
        "subjectTypeUUID",
        "verifyPhoneNumber",
        "captureLocationInformation",
        "encounterTypeUUID",
        "encounterScope",
        "encounterIdentifier"
      ]
    };
  }

  async onLoad() {
    if (this.props.isCreatePage) {
      const response = await http.get("/concept/dataTypes");
      this.setState({
        dataTypes: sortBy(response.data)
      });
    } else {
      const concept = await ConceptService.getConcept(this.props.match.params.uuid);
      this.setState({ concept });
    }

    const opModules = await http.get("/web/operationalModules");
    this.setState(state => ({ ...state, operationalModules: opModules.data }));
  }

  componentDidMount() {
    this.onLoad();
  }

  getDefaultSnackbarStatus = defaultSnackbarStatus => {
    this.setState({ defaultSnackbarStatus: defaultSnackbarStatus });
  };

  setRedirectShow = () => {
    this.setState({
      redirectShow: true
    });
  };

  onDeleteAnswer = index => {
    const answers = [...this.state.concept.answers];
    answers.splice(index, 1);
    this.setState({ concept: { ...this.state.concept, answers } });
  };

  onAddAnswer = () => {
    this.setState({
      concept: { ...this.state.concept, answers: [...this.state.concept.answers, WebConceptAnswerView.emptyAnswer()] }
    });
  };

  onChangeAnswerName = (answer, index) => {
    const answers = [...this.state.concept.answers];
    answers[index].name = answer;
    this.setState({ concept: { ...this.state.concept, answers } });
  };

  handleMediaDelete = () => {
    this.setState({ concept: { ...this.state.concept, mediaUrl: null, unSavedMediaFile: null } });
  };

  onMoveUp = index => {
    this.setState({
      concept: { ...this.state.concept, answers: moveUp(this.state.concept.answers, index) }
    });
  };

  onMoveDown = index => {
    this.setState({
      concept: { ...this.state.concept, answers: moveDown(this.state.concept.answers, index) }
    });
  };

  onAlphabeticalSort = () => {
    this.setState({
      concept: { ...this.state.concept, answers: alphabeticalSort(this.state.concept.answers) }
    });
  };

  onSelectAnswerMedia = (mediaFile, index) => {
    const answers = [...this.state.concept.answers];
    answers[index].unSavedMediaFile = mediaFile;
    this.setState({ concept: { ...this.state.concept, answers } });
  };

  onRemoveAnswerMedia = index => {
    const answers = [...this.state.concept.answers];
    answers[index].unSavedMediaFile = null;
    answers[index].mediaUrl = null;
    this.setState({ concept: { ...this.state.concept, answers } });
  };

  onToggleAnswerField = (event, index) => {
    const answers = [...this.state.concept.answers];
    answers[index][event.target.id] = !answers[index][event.target.id];
    this.setState({
      concept: { ...this.state.concept, answers }
    });
  };

  handleChange = stateHandler => e => {
    const resetKeyValues = this.props.isCreatePage && stateHandler === "dataType" && e.target.value !== "Location";
    const c = { ...this.state.concept };
    c[stateHandler] = replace(e.target.value, "|", "");
    if (resetKeyValues) c.keyValues = [];
    this.setState({
      concept: c
    });
  };

  validateKeyValues = (error, key, errorKey) => {
    const keyValue = this.state.concept.keyValues.find(keyValue => keyValue.key === key);
    if (keyValue === undefined || keyValue.value === "") {
      error[errorKey] = true;
    }
  };

  formValidation = async () => {
    let error = {};
    const concept = this.state.concept;
    const answers = concept.answers;
    if (concept.dataType === "") {
      error["dataTypeSelectionAlert"] = true;
    }
    if (concept.name.trim() === "") {
      error["isEmptyName"] = true;
    }

    // Use WebConcept validation for numeric ranges
    const numericRangeErrors = WebConcept.validateNumericRanges(concept);
    error = { ...error, ...numericRangeErrors };

    if (concept.dataType === "Coded") {
      validateCodedConceptAnswers(answers);
      if (answers.some(answer => answer["isAnswerHavingError"].isErrored)) {
        error["isAnswerHavingError"] = true;
      }
    }

    if (concept.dataType === "Location") {
      const lowestLevelKeyValue = concept.keyValues.find(keyValue => keyValue.key === "lowestAddressLevelTypeUUIDs");
      if (lowestLevelKeyValue === undefined || lowestLevelKeyValue.value.length === 0) {
        error["lowestAddressLevelRequired"] = true;
      }

      const highestLevelKeyValue = concept.keyValues.find(keyValue => keyValue.key === "highestAddressLevelTypeUUID");
      if (highestLevelKeyValue !== undefined && highestLevelKeyValue.value === "") {
        error["highestAddressLevelRequired"] = true;
      }
    }

    if (concept.dataType === "Subject") {
      this.validateKeyValues(error, "subjectTypeUUID", "subjectTypeRequired");
    }

    if (concept.dataType === "Encounter") {
      this.validateKeyValues(error, "encounterTypeUUID", "encounterTypeRequired");
      this.validateKeyValues(error, "encounterScope", "encounterScopeRequired");
      this.validateKeyValues(error, "encounterIdentifier", "encounterIdentifierRequired");
    }

    const emptyKeyValues = filter(concept.keyValues, ({ key, value }) => key === "" || value === "");
    if (emptyKeyValues.length > 0) {
      error["keyValueError"] = true;
    }

    this.setState({
      error: error,
      answers: answers
    });

    if (Object.keys(error).length === 0) await this.afterSuccessfulValidation();
  };

  handleSubmit = e => {
    e.preventDefault();
    this.formValidation();
  };

  afterSuccessfulValidation = async () => {
    const { concept, error } = await ConceptService.saveConcept(this.state.concept);
    if (error) {
      this.setState({
        error: { mediaUploadFailed: true, message: error }
      });
      return;
    }
    const newState = {
      conceptCreationAlert: true,
      defaultSnackbarStatus: true,
      redirectShow: !this.props.isCreatePage,
      redirectOnDeleteOrCreate: this.props.isCreatePage,
      concept: this.props.isCreatePage ? WebConceptView.emptyConcept() : concept
    };

    this.setState(newState);
  };
  onNumericConceptAttributeAssignment = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  castValueToBooleanOrInt = ({ key, value }) => {
    let castedValue;
    try {
      castedValue = JSON.parse(trim(value));
    } catch (e) {
      castedValue = trim(value);
    }
    return { key: trim(key), value: castedValue };
  };

  handleObjectValue = ({ key, value }) => {
    return { key: trim(key), value: value };
  };

  onKeyValueChange = (keyValue, index) => {
    const keyValues = this.state.concept.keyValues;
    keyValues[index] = typeof keyValue.value === "object" ? this.handleObjectValue(keyValue) : this.castValueToBooleanOrInt(keyValue);
    this.setState({
      concept: { ...this.state.concept, keyValues }
    });
  };

  onAddNewKeyValue = () => {
    const keyValues = this.state.concept.keyValues || [];
    keyValues.push({ key: "", value: "" });
    this.setState({
      concept: { ...this.state.concept, keyValues }
    });
  };

  onDeleteKeyValue = index => {
    const keyValues = this.state.concept.keyValues;
    keyValues.splice(index, 1);
    this.setState({
      concept: { ...this.state.concept, keyValues }
    });
  };

  handleActive = event => {
    this.setState({
      active: event.target.checked
    });
  };

  handleMediaSelect = mediaFile => {
    this.setState({ concept: { ...this.state.concept, unSavedMediaFile: mediaFile } });
  };

  onDeleteConcept = () => {
    if (window.confirm("Do you really want to delete the concept?")) {
      http.delete(`/concept/${this.state.concept.uuid}`).then(response => {
        if (response.status === 200) {
          this.setState({
            redirectShow: false,
            redirectOnDeleteOrCreate: true
          });
        }
      });
    }
  };

  render() {
    let dataTypeComponent;
    const classes = {
      textField: {
        width: 400,
        marginRight: 10
      },
      select: {
        width: 400,
        height: 40,
        marginTop: 24
      },
      button: {
        marginTop: 40
      },
      inputLabel: {
        marginTop: 15,
        fontSize: 16
      }
    };

    const conceptCreationMessage = this.props.isCreatePage ? "Concept created successfully." : "Concept updated successfully.";
    const appBarTitle = this.props.isCreatePage ? "Create Concept" : "Edit Concept";
    const concept = this.state.concept;

    if (concept.dataType === "Numeric") {
      dataTypeComponent = (
        <NumericConcept
          onNumericConceptAttributeAssignment={this.onNumericConceptAttributeAssignment}
          numericDataTypeAttributes={concept}
        />
      );
    }
    if (concept.dataType === "Coded") {
      dataTypeComponent = (
        <CodedConcept
          answers={concept.answers}
          onDeleteAnswer={this.onDeleteAnswer}
          onAddAnswer={this.onAddAnswer}
          onChangeAnswerName={this.onChangeAnswerName}
          onToggleAnswerField={this.onToggleAnswerField}
          onMoveUp={this.onMoveUp}
          onMoveDown={this.onMoveDown}
          onAlphabeticalSort={this.onAlphabeticalSort}
          onSelectAnswerMedia={this.onSelectAnswerMedia}
          onRemoveAnswerMedia={this.onRemoveAnswerMedia}
        />
      );
    }

    if (concept.dataType === "Location") {
      dataTypeComponent = (
        <LocationConcept
          updateConceptKeyValues={this.onKeyValueChange}
          keyValues={concept.keyValues}
          error={this.state.error}
          isCreatePage={this.props.isCreatePage}
          inlineConcept={false}
        />
      );
    }

    if (concept.dataType === "Subject") {
      dataTypeComponent = (
        <SubjectConcept
          updateKeyValues={this.onKeyValueChange}
          keyValues={concept.keyValues}
          error={this.state.error}
          isCreatePage={this.props.isCreatePage}
          inlineConcept={false}
          operationalModules={this.state.operationalModules}
        />
      );
    }

    if (concept.dataType === "Encounter") {
      dataTypeComponent = (
        <EncounterConcept
          updateKeyValues={this.onKeyValueChange}
          keyValues={concept.keyValues}
          error={this.state.error}
          isCreatePage={this.props.isCreatePage}
          inlineConcept={false}
          operationalModules={this.state.operationalModules}
        />
      );
    }

    if (concept.dataType === "PhoneNumber") {
      const verificationKey = find(concept.keyValues, ({ key, value }) => key === "verifyPhoneNumber");
      if (verificationKey) {
        dataTypeComponent = <PhoneNumberConcept onKeyValueChange={this.onKeyValueChange} checked={verificationKey.value} />;
      } else {
        this.setState(prevState => ({
          ...prevState,
          keyValues: [{ key: "verifyPhoneNumber", value: false }]
        }));
      }
    }

    if (concept.dataType === "ImageV2") {
      const locationInformationKey = find(concept.keyValues, ({ key, value }) => key === "captureLocationInformation");
      if (locationInformationKey) {
        dataTypeComponent = <ImageV2Concept onKeyValueChange={this.onKeyValueChange} checked={locationInformationKey.value} />;
      } else {
        this.setState(prevState => ({
          ...prevState,
          keyValues: [{ key: "captureLocationInformation", value: false }]
        }));
      }
    }

    return (
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <DocumentationContainer filename={"Concept.md"}>
          <Title title={appBarTitle} />
          {!this.props.isCreatePage && (
            <Grid container justifyContent="flex-end" mb={2}>
              <Button color="primary" type="button" onClick={() => this.setRedirectShow()}>
                <VisibilityIcon /> Show
              </Button>
            </Grid>
          )}
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <AvniTextField
                id="name"
                label="Concept name"
                value={concept.name}
                onChange={this.handleChange("name")}
                style={classes.textField}
                margin="normal"
                autoComplete="off"
                toolTipKey={"APP_DESIGNER_CONCEPT_NAME"}
                fullWidth
              />
              {this.state.error.isEmptyName && <FormHelperText error>*Required.</FormHelperText>}
              {!this.state.error.isEmptyName &&
                (this.state.error.nameError && <FormHelperText error>Same name concept already exist.</FormHelperText>)}
            </Grid>
            <Grid item xs={12}>
              {this.props.isCreatePage ? (
                <ToolTipContainer toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}>
                  <FormControl fullWidth>
                    <InputLabel style={classes.inputLabel}>Datatype *</InputLabel>
                    <Select
                      id="dataType"
                      label="DataType"
                      value={concept.dataType}
                      onChange={this.handleChange("dataType")}
                      style={classes.select}
                    >
                      {this.state.dataTypes.map(datatype => (
                        <MenuItem value={datatype} key={datatype}>
                          {datatype}
                        </MenuItem>
                      ))}
                    </Select>
                    {this.state.error.dataTypeSelectionAlert && <FormHelperText error>*Required</FormHelperText>}
                  </FormControl>
                </ToolTipContainer>
              ) : (
                <AvniTextField
                  id="dataType"
                  label="DataType"
                  value={concept.dataType}
                  style={classes.select}
                  disabled={true}
                  toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}
                  fullWidth
                />
              )}
            </Grid>
            {!this.props.isCreatePage && (
              <Grid item xs={12}>
                <ConceptActiveSwitch active={concept.active} handleActive={this.handleActive} conceptUUID={concept.uuid} />
              </Grid>
            )}
            {["Coded", "NA"].includes(concept.dataType) && (
              <Grid item xs={12}>
                <AvniImageUpload
                  height={20}
                  width={20}
                  onSelect={this.handleMediaSelect}
                  label={`Image (max ${Math.round((WebConceptView.MaxFileSize / 1024 + Number.EPSILON) * 10) / 10} KB)`}
                  maxFileSize={WebConceptView.MaxFileSize}
                  oldImgUrl={concept.mediaUrl}
                  onDelete={this.handleMediaDelete}
                />
                {this.state.error && this.state.error.mediaUploadFailed && (
                  <FormControl error style={{ marginTop: 4 }}>
                    <FormHelperText error>{this.state.error.message}</FormHelperText>
                  </FormControl>
                )}
              </Grid>
            )}
            <Grid item xs={12}>
              {dataTypeComponent}
            </Grid>
            <Grid item xs={12}>
              <KeyValues
                keyValues={concept.keyValues}
                onKeyValueChange={this.onKeyValueChange}
                onAddNewKeyValue={this.onAddNewKeyValue}
                onDeleteKeyValue={this.onDeleteKeyValue}
                error={this.state.error.keyValueError}
                readOnlyKeys={this.state.readOnlyKeys}
              />
            </Grid>
            <Grid item xs={12} container justifyContent="flex-end" alignItems="center" spacing={2}>
              <Grid item>
                <SaveComponent name="save" onSubmit={this.handleSubmit} styleClass={{ marginLeft: "12px", marginTop: "10px" }} />
              </Grid>
              <Grid item>
                {!this.props.isCreatePage && (
                  <Button style={{ color: "red", marginTop: "10px" }} onClick={() => this.onDeleteConcept()}>
                    <DeleteIcon /> Delete
                  </Button>
                )}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {this.state.conceptCreationAlert && (
                <CustomizedSnackbar
                  message={conceptCreationMessage}
                  getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
                  defaultSnackbarStatus={this.state.defaultSnackbarStatus}
                />
              )}
            </Grid>
          </Grid>
        </DocumentationContainer>
        {this.state.redirectShow && <Redirect to={`/appDesigner/concept/${concept.uuid}/show`} />}
        {this.state.redirectOnDeleteOrCreate && <Redirect to={`/appDesigner/concepts`} />}
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

CreateEditConcept.propTypes = { isCreatePage: PropTypes.bool };
CreateEditConcept.defaultProps = { isCreatePage: false, enableLeftMenuButton: true };
export default connect(mapStateToProps)(CreateEditConcept);
