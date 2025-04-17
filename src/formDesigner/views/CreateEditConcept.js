import React, { Component } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import http from "common/utils/httpClient";
import { default as UUID } from "uuid";
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
import { filter, find, isEmpty, remove, replace, sortBy, toLower, trim } from "lodash";
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
import { ConceptAnswerError, WebConceptView, WebConceptAnswerView } from "../../common/model/WebConcept";

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
      ...emptyConcept,
      conceptCreationAlert: false,
      error: {},
      dataTypes: [],
      defaultSnackbarStatus: true,
      redirectShow: false,
      redirectOnDelete: false,
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

  componentDidMount() {
    if (this.props.isCreatePage) {
      http.get("/concept/dataTypes").then(response => {
        this.setState({
          dataTypes: sortBy(response.data)
        });
      });
    } else {
      ConceptService.getConcept(this.props.match.params.uuid).then(concept => {
        this.setState({
          ...concept
        });
      });
    }

    http.get("/web/operationalModules").then(response => {
      this.setState(state => ({ ...state, operationalModules: response.data }));
    });
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
    const answers = [...this.state.answers];
    answers.splice(index, 1);
    this.setState({ answers });
  };

  onAddAnswer = () => {
    this.setState({
      answers: [...this.state.answers, WebConceptAnswerView.emptyAnswer()]
    });
  };

  onChangeAnswer = (answer, index) => {
    const answers = [...this.state.answers];
    this.setState({
      answers
    });
  };

  onMoveUp = index => {
    this.setState({
      answers: moveUp(this.state.answers, index)
    });
  };

  onMoveDown = index => {
    this.setState({
      answers: moveDown(this.state.answers, index)
    });
  };

  onAlphabeticalSort = () => {
    this.setState({
      answers: alphabeticalSort(this.state.answers)
    });
  };

  onToggleAnswerField = (event, index) => {
    const answers = [...this.state.answers];
    answers[index][event.target.id] = !answers[index][event.target.id];
    this.setState({
      answers
    });
  };

  handleChange = stateHandler => e => {
    this.setState({
      [stateHandler]: replace(e.target.value, "|", "")
    });
    this.resetKeyValuesIfNeeded(stateHandler, e);
  };

  resetKeyValuesIfNeeded(stateHandler, e) {
    if (this.props.isCreatePage && stateHandler === "dataType" && e.target.value !== "Location") {
      this.setState({ keyValues: [] });
    }
  }

  validateKeyValues = (error, key, errorKey) => {
    const keyValue = this.state.keyValues.find(keyValue => keyValue.key === key);
    if (keyValue === undefined || keyValue.value === "") {
      error[errorKey] = true;
    }
  };

  formValidation = () => {
    const conceptName = this.state.name;
    let error = {};
    const answers = this.state.answers;
    if (this.state.dataType === "") {
      error["dataTypeSelectionAlert"] = true;
    }
    if (this.state.name.trim() === "") {
      error["isEmptyName"] = true;
    }
    if (this.state.dataType === "Numeric" && parseInt(this.state.lowAbsolute) > parseInt(this.state.highAbsolute)) {
      error["absoluteValidation"] = true;
    }
    if (this.state.dataType === "Numeric" && parseInt(this.state.lowNormal) > parseInt(this.state.highNormal)) {
      error["normalValidation"] = true;
    }

    if (this.state.dataType === "Coded") {
      validateCodedConceptAnswers(answers);
      if (answers.some(answer => answer["isAnswerHavingError"].isErrored)) {
        error["isAnswerHavingError"] = true;
      }
    }

    if (this.state.dataType === "Location") {
      const lowestLevelKeyValue = this.state.keyValues.find(keyValue => keyValue.key === "lowestAddressLevelTypeUUIDs");
      if (lowestLevelKeyValue === undefined || lowestLevelKeyValue.value.length === 0) {
        error["lowestAddressLevelRequired"] = true;
      }

      const highestLevelKeyValue = this.state.keyValues.find(keyValue => keyValue.key === "highestAddressLevelTypeUUID");
      if (highestLevelKeyValue !== undefined && highestLevelKeyValue.value === "") {
        error["highestAddressLevelRequired"] = true;
      }
    }

    if (this.state.dataType === "Subject") {
      this.validateKeyValues(error, "subjectTypeUUID", "subjectTypeRequired");
    }

    if (this.state.dataType === "Encounter") {
      this.validateKeyValues(error, "encounterTypeUUID", "encounterTypeRequired");
      this.validateKeyValues(error, "encounterScope", "encounterScopeRequired");
      this.validateKeyValues(error, "encounterIdentifier", "encounterIdentifierRequired");
    }

    const emptyKeyValues = filter(this.state.keyValues, ({ key, value }) => key === "" || value === "");
    if (emptyKeyValues.length > 0) {
      error["keyValueError"] = true;
    }

    this.setState({
      error: error,
      answers: answers
    });

    Object.keys(error).length === 0 && this.afterSuccessfulValidation();
  };

  handleSubmit = e => {
    e.preventDefault();

    this.formValidation();
  };

  handleSubmit = e => {
    e.preventDefault();

    this.formValidation();
  };

  afterSuccessfulValidation = async () => {
    const concept = await ConceptService.saveConcept(
      this.state.name,
      this.state.uuid,
      this.state.dataType,
      this.state.keyValues,
      this.state.answers,
      this.state.active,
      this.state.mediaFile,
      this.state.lowAbsolute,
      this.state.highAbsolute,
      this.state.lowNormal,
      this.state.highNormal,
      this.state.unit
    );
    this.setState({
      conceptCreationAlert: true,
      defaultSnackbarStatus: true,
      redirectShow: true,
      name: this.props.isCreatePage ? "" : concept.name,
      uuid: this.props.isCreatePage ? "" : concept.uuid,
      dataType: this.props.isCreatePage ? "" : concept.dataType,
      keyValues: this.props.isCreatePage ? [] : concept.keyValues,
      lowAbsolute: this.props.isCreatePage ? "" : concept.lowAbsolute,
      highAbsolute: this.props.isCreatePage ? "" : concept.highAbsolute,
      lowNormal: this.props.isCreatePage ? "" : concept.lowNormal,
      highNormal: this.props.isCreatePage ? "" : concept.highNormal,
      unit: this.props.isCreatePage ? "" : concept.unit,
      answers: this.props.isCreatePage ? [] : concept.answers
    });

    if (this.state.dataType === "Coded") {
      this.saveCodedAnswers(this.state.answers);
    } else {
      if (!this.state.error.absoluteValidation || !this.state.error.normalValidation) {
        const Uuid = UUID.v4();
        http
          .post("/concepts", [
            {
              name: this.state.name,
              uuid: this.props.isCreatePage ? Uuid : this.state.uuid,
              dataType: this.state.dataType,
              keyValues: this.state.keyValues,
              lowAbsolute: this.state.lowAbsolute,
              highAbsolute: this.state.highAbsolute,
              lowNormal: this.state.lowNormal,
              highNormal: this.state.highNormal,
              unit: this.state.unit === "" ? null : this.state.unit,
              active: this.props.isCreatePage ? true : this.state.active
            }
          ])
          .then(response => {
            if (response.status === 200) {
            }
          });
      }
    }
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
    const keyValues = this.state.keyValues;
    keyValues[index] = typeof keyValue.value === "object" ? this.handleObjectValue(keyValue) : this.castValueToBooleanOrInt(keyValue);
    this.setState({ ...this.state, keyValues });
  };

  onAddNewKeyValue = () => {
    const keyValues = this.state.keyValues || [];
    keyValues.push({ key: "", value: "" });
    this.setState({ ...this.state, keyValues });
  };

  onDeleteKeyValue = index => {
    const keyValues = this.state.keyValues;
    keyValues.splice(index, 1);
    this.setState({ ...this.state, keyValues });
  };

  handleActive = event => {
    this.setState({
      active: event.target.checked
    });
  };

  handleMediaSelect = (mediaFile, index) => {
    this.setState({ ...this.state, mediaFile });
  };

  onDeleteConcept = () => {
    if (window.confirm("Do you really want to delete the concept?")) {
      http.delete(`/concept/${this.state.uuid}`).then(response => {
        if (response.status === 200) {
          this.setState({
            redirectShow: false,
            redirectOnDelete: true
          });
        }
      });
    }
  };

  render() {
    let dataType;
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

    if (this.state.dataType === "Numeric") {
      dataType = (
        <NumericConcept
          onNumericConceptAttributeAssignment={this.onNumericConceptAttributeAssignment}
          numericDataTypeAttributes={this.state}
        />
      );
    }
    if (this.state.dataType === "Coded") {
      dataType = (
        <CodedConcept
          answers={this.state.answers}
          onDeleteAnswer={this.onDeleteAnswer}
          onAddAnswer={this.onAddAnswer}
          onChangeAnswerName={this.onChangeAnswer}
          onToggleAnswerField={this.onToggleAnswerField}
          onMoveUp={this.onMoveUp}
          onMoveDown={this.onMoveDown}
          onAlphabeticalSort={this.onAlphabeticalSort}
          onSelectAnswerMedia={this.onSelectAnswerMedia}
        />
      );
    }

    if (this.state.dataType === "Location") {
      dataType = (
        <LocationConcept
          updateConceptKeyValues={this.onKeyValueChange}
          keyValues={this.state.keyValues}
          error={this.state.error}
          isCreatePage={this.props.isCreatePage}
          inlineConcept={false}
        />
      );
    }

    if (this.state.dataType === "Subject") {
      dataType = (
        <SubjectConcept
          updateKeyValues={this.onKeyValueChange}
          keyValues={this.state.keyValues}
          error={this.state.error}
          isCreatePage={this.props.isCreatePage}
          inlineConcept={false}
          operationalModules={this.state.operationalModules}
        />
      );
    }

    if (this.state.dataType === "Encounter") {
      dataType = (
        <EncounterConcept
          updateKeyValues={this.onKeyValueChange}
          keyValues={this.state.keyValues}
          error={this.state.error}
          isCreatePage={this.props.isCreatePage}
          inlineConcept={false}
          operationalModules={this.state.operationalModules}
        />
      );
    }

    if (this.state.dataType === "PhoneNumber") {
      const verificationKey = find(this.state.keyValues, ({ key, value }) => key === "verifyPhoneNumber");
      if (verificationKey) {
        dataType = <PhoneNumberConcept onKeyValueChange={this.onKeyValueChange} checked={verificationKey.value} />;
      } else {
        this.setState(prevState => ({
          ...prevState,
          keyValues: [{ key: "verifyPhoneNumber", value: false }]
        }));
      }
    }

    if (this.state.dataType === "ImageV2") {
      const locationInformationKey = find(this.state.keyValues, ({ key, value }) => key === "captureLocationInformation");
      if (locationInformationKey) {
        dataType = <ImageV2Concept onKeyValueChange={this.onKeyValueChange} checked={locationInformationKey.value} />;
      } else {
        this.setState(prevState => ({
          ...prevState,
          keyValues: [{ key: "captureLocationInformation", value: false }]
        }));
      }
    }

    return (
      <Box boxShadow={2} p={2} bgcolor="background.paper">
        <DocumentationContainer filename={"Concept.md"}>
          <Title title={appBarTitle} />
          {!this.props.isCreatePage && (
            <Grid container item={12} style={{ justifyContent: "flex-end" }}>
              <Button color="primary" type="button" onClick={() => this.setRedirectShow()}>
                <VisibilityIcon /> Show
              </Button>
            </Grid>
          )}
          <div className="container" style={{ float: "left" }}>
            <div>
              <AvniTextField
                id="name"
                label="Concept name"
                value={this.state.name}
                onChange={this.handleChange("name")}
                style={classes.textField}
                margin="normal"
                autoComplete="off"
                toolTipKey={"APP_DESIGNER_CONCEPT_NAME"}
              />
              {this.state.error.isEmptyName && <FormHelperText error>*Required.</FormHelperText>}
              {!this.state.error.isEmptyName &&
                (this.state.error.nameError && <FormHelperText error>Same name concept already exist.</FormHelperText>)}
            </div>

            <div>
              {this.props.isCreatePage && (
                <ToolTipContainer toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}>
                  <FormControl>
                    <InputLabel style={classes.inputLabel}>Datatype *</InputLabel>
                    <Select
                      id="dataType"
                      label="DataType"
                      value={this.state.dataType}
                      onChange={this.handleChange("dataType")}
                      style={classes.select}
                    >
                      {this.state.dataTypes.map(datatype => {
                        return (
                          <MenuItem value={datatype} key={datatype}>
                            {datatype}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {this.state.error.dataTypeSelectionAlert && <FormHelperText error>*Required</FormHelperText>}
                  </FormControl>
                </ToolTipContainer>
              )}
              {!this.props.isCreatePage && (
                <AvniTextField
                  id="dataType"
                  label="DataType"
                  value={this.state.dataType}
                  style={classes.select}
                  disabled={true}
                  toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}
                />
              )}
            </div>
            {!this.props.isCreatePage && (
              <>
                <p />
                <ConceptActiveSwitch active={this.state.active} handleActive={this.handleActive} conceptUUID={this.state.uuid} />
                <p />
              </>
            )}

            {dataType}
            <AvniImageUpload height={20} width={20} allowUpload={true} onSelect={this.handleMediaSelect} />
            <KeyValues
              keyValues={this.state.keyValues}
              onKeyValueChange={this.onKeyValueChange}
              onAddNewKeyValue={this.onAddNewKeyValue}
              onDeleteKeyValue={this.onDeleteKeyValue}
              error={this.state.error.keyValueError}
              readOnlyKeys={this.state.readOnlyKeys}
            />
          </div>

          <Grid container item sm={12}>
            <Grid item sm={2}>
              <SaveComponent name="save" onSubmit={this.handleSubmit} styleClass={{ marginLeft: "12px", marginTop: "10px" }} />{" "}
            </Grid>
            <Grid item sm={10}>
              {!this.props.isCreatePage && (
                <Button style={{ float: "right", color: "red", marginTop: "10px" }} onClick={() => this.onDeleteConcept()}>
                  <DeleteIcon /> Delete
                </Button>
              )}
            </Grid>
          </Grid>

          {this.state.conceptCreationAlert && (
            <CustomizedSnackbar
              message={conceptCreationMessage}
              getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
              defaultSnackbarStatus={this.state.defaultSnackbarStatus}
            />
          )}
        </DocumentationContainer>
        {this.state.redirectShow && <Redirect to={`/appDesigner/concept/${this.state.uuid}/show`} />}
        {this.state.redirectOnDelete && <Redirect to={`/appDesigner/concepts`} />}
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
