import React, { Component } from "react";
import PropTypes from "prop-types";
import _, { cloneDeep, isEmpty } from "lodash";
import http from "common/utils/httpClient";
import Grid from "@material-ui/core/Grid";
import FormElementGroup from "../components/FormElementGroup";
import Button from "@material-ui/core/Button";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import { FormControl } from "@material-ui/core";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import produce from "immer";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Redirect } from "react-router-dom";

import { SaveComponent } from "../../common/components/SaveComponent";
import FormLevelRules from "../components/FormLevelRules";
import { SystemInfo } from "../components/SystemInfo";
import StaticFormElementGroup from "../components/StaticFormElementGroup";
import { DeclarativeRuleHolder } from "rules-config";
import FormDesignerContext from "./FormDesignerContext";
import {
  formDesignerAddFormElement,
  formDesignerAddFormElementGroup,
  formDesignerDeleteFormElement,
  formDesignerDeleteGroup,
  formDesignerHandleConceptFormLibrary,
  formDesignerHandleExcludedAnswers,
  formDesignerHandleGroupElementChange,
  formDesignerHandleGroupElementKeyValueChange,
  formDesignerHandleInlineCodedAnswerAddition,
  formDesignerHandleInlineCodedConceptAnswers,
  formDesignerHandleInlineConceptAttributes,
  formDesignerHandleInlineNumericAttributes,
  formDesignerHandleModeForDate,
  formDesignerHandleRegex,
  formDesignerOnConceptAnswerAlphabeticalSort,
  formDesignerOnConceptAnswerMoveDown,
  formDesignerOnConceptAnswerMoveUp,
  formDesignerOnDeleteInlineConceptCodedAnswerDelete,
  formDesignerOnSaveInlineConcept,
  formDesignerOnToggleInlineConceptCodedAnswerAttribute,
  formDesignerUpdateConceptElementData,
  formDesignerUpdateDragDropOrderForFirstGroup
} from "../common/FormDesignerHandlers";
import { FormTypeEntities } from "../common/constants";
import { connect } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Concept } from "openchs-models";
import { SubjectTypeType } from "../../adminApp/SubjectType/Types";

export const isNumeric = concept => concept.dataType === "Numeric";

export const isText = concept => concept.dataType === "Text";

export const areValidFormatValuesValid = formElement => {
  if (!isNumeric(formElement.concept) && !isText(formElement.concept)) return true;
  if (!formElement.validFormat) return true;
  return isEmpty(formElement.validFormat.regex) === isEmpty(formElement.validFormat.descriptionKey);
};

export function TabContainer({ skipStyles, ...props }) {
  const typographyCSS = skipStyles ? {} : { padding: 8 * 3 };
  return (
    <Typography {...props} component="div" style={typographyCSS}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const personStaticFormElements = [
  { name: "First name", dataType: Concept.dataType.Text },
  { name: "Last name", dataType: Concept.dataType.Text },
  { name: "Date of birth", dataType: Concept.dataType.Date },
  { name: "Age", dataType: Concept.dataType.Numeric },
  { name: "Gender", dataType: Concept.dataType.Coded },
  { name: "Address", dataType: Concept.dataType.Coded }
];

const nonPersonStaticFormElements = [
  { name: "Name", dataType: Concept.dataType.Text },
  { name: "Address", dataType: Concept.dataType.Coded }
];

const householdStaticFormElements = [
  { name: "Name", dataType: Concept.dataType.Text },
  { name: "Total members", dataType: Concept.dataType.Numeric },
  { name: "Address", dataType: Concept.dataType.Coded }
];

const userStaticFormElements = [{ name: "First name", dataType: Concept.dataType.Text }];

function getStaticFormElements(subjectType) {
  if (_.isEmpty(subjectType)) {
    return [];
  }
  switch (subjectType.type) {
    case SubjectTypeType.Person:
      return personStaticFormElements;
    case SubjectTypeType.Household:
      return householdStaticFormElements;
    case SubjectTypeType.User:
      return userStaticFormElements;
    default:
      return nonPersonStaticFormElements;
  }
}

class FormDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: [],
      identifierSources: [],
      groupSubjectTypes: [],
      name: "",
      timed: false,
      errorMsg: "",
      saveCall: false,
      createFlag: true,
      activeTabIndex: 0,
      successAlert: false,
      defaultSnackbarStatus: true,
      detectBrowserCloseEvent: false,
      nameError: false,
      redirectToWorkflow: false,
      availableDataTypes: []
    };
    this.btnGroupClick = this.btnGroupClick.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.btnGroupAdd = this.btnGroupAdd.bind(this);
    this.handleGroupElementChange = this.handleGroupElementChange.bind(this);
    this.handleGroupElementKeyValueChange = this.handleGroupElementKeyValueChange.bind(this);
    this.handleExcludedAnswers = this.handleExcludedAnswers.bind(this);
    this.updateConceptElementData = this.updateConceptElementData.bind(this);
    this.handleModeForDate = this.handleModeForDate.bind(this);
    this.handleRegex = this.handleRegex.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleConceptFormLibrary = this.handleConceptFormLibrary.bind(this);
    this.handleInlineNumericAttributes = this.handleInlineNumericAttributes.bind(this);
    this.handleInlineLocationAttributes = this.handleInlineLocationAttributes.bind(this);
    this.handleInlineSubjectAttributes = this.handleInlineSubjectAttributes.bind(this);
    this.handleInlineEncounterAttributes = this.handleInlineEncounterAttributes.bind(this);
    this.handleInlinePhoneNumberAttributes = this.handleInlinePhoneNumberAttributes.bind(this);
  }

  onUpdateFormName = name => {
    // this function is because of we are using name in this component.
    this.setState({ name: name, detectBrowserCloseEvent: true });
  };

  onTabHandleChange = (event, value) => {
    this.setState({ activeTabIndex: value });
  };

  getDefaultSnackbarStatus = defaultSnackbarStatus => {
    this.setState({ defaultSnackbarStatus: defaultSnackbarStatus });
  };

  setupBeforeUnloadListener = () => {
    window.addEventListener("beforeunload", ev => {
      ev.preventDefault();
      this.state.detectBrowserCloseEvent && (ev.returnValue = "Are you sure you want to close?");
    });
  };

  componentDidMount() {
    this.setupBeforeUnloadListener();
    const transformIdentifierSources = identifierSourcesFromServer =>
      _.map(identifierSourcesFromServer, source => ({ value: source.uuid, label: source.name }));

    http.get(`/web/identifierSource`).then(response => {
      let responseData = _.get(response, "data._embedded.identifierSource", []);
      this.setState({
        identifierSources: transformIdentifierSources(responseData)
      });
    });

    http
      .fetchJson("/web/operationalModules/")
      .then(response => response.json)
      .then(({ subjectTypes, encounterTypes }) => {
        const groupSubjectTypes = _.filter(subjectTypes, st => !!st.group);
        this.setState({ groupSubjectTypes });
        this.setState({ encounterTypes });
      });

    return this.getForm();
  }

  getForm() {
    return http
      .get(`/forms/export?formUUID=${this.props.match.params.formUUID}`)
      .then(response => response.data)
      .then(form => {
        /*

        Below visitScheduleRule, decisionRule, validationRule are for handling form level rules and
        decisionExpand, visitScheduleExpand, validationExpand are for handling expand button.

        */
        form["visitScheduleRule"] = form.visitScheduleRule ? form.visitScheduleRule : "";
        form["decisionRule"] = form.decisionRule ? form.decisionRule : "";
        form["validationRule"] = form.validationRule ? form.validationRule : "";
        form["checklistsRule"] = form.checklistsRule ? form.checklistsRule : "";
        form["decisionExpand"] = false;
        form["visitScheduleExpand"] = false;
        form["validationExpand"] = false;
        form["checklistExpand"] = false;

        _.forEach(form.formElementGroups, group => {
          group.groupId = (group.groupId || group.name).replace(/[^a-zA-Z0-9]/g, "_");
          group.expanded = false;
          group.error = false;
          group.formElements.forEach(fe => {
            fe.expanded = false;
            fe.error = false;
            fe.showConceptLibrary = "chooseFromLibrary";
            let keyValueObject = {};

            fe.keyValues.map(keyValue => {
              return (keyValueObject[keyValue.key] = keyValue.value);
            });

            // "Date", "Duration"
            if (["Date", "Duration"].includes(fe.concept.dataType)) {
              if (!Object.keys(keyValueObject).includes("durationOptions")) {
                keyValueObject["durationOptions"] = [];
              }
            }
            if (fe.concept.dataType === "Coded" && keyValueObject["ExcludedAnswers"] !== undefined) {
              _.forEach(fe.concept.answers, answer => {
                if (keyValueObject["ExcludedAnswers"].includes(answer.name) && !answer.voided) {
                  answer["excluded"] = true;
                }
              });
            }

            fe.keyValues = keyValueObject;
          });
        });
        let dataGroupFlag = this.countGroupElements(form);
        this.setState({
          form: form,
          name: form.name,
          timed: form.timed,
          createFlag: dataGroupFlag,
          formType: form.formType,
          subjectType: form.subjectType,
          disableForm: form.organisationId === 1,
          dataLoaded: true
        });
        if (dataGroupFlag) {
          this.btnGroupClick();
        }
      });
  }

  countGroupElements(form) {
    let groupFlag = true;
    _.forEach(form.formElementGroups, (groupElement, index) => {
      if (!groupElement.voided) {
        groupFlag = false;
      }
    });
    return groupFlag;
  }

  reOrderSequence(form, index = -1) {
    if (index <= -1) {
      _.forEach(form.formElementGroups, (group, ind) => {
        group.displayOrder = ind + 1;
      });
    } else {
      _.forEach(form.formElementGroups[index].formElements, (element, ind) => {
        element.displayOrder = ind + 1;
      });
    }
  }

  // Group level events
  deleteGroup(index, elementIndex = -1) {
    if (elementIndex === -1) {
      this.setState(produce(draft => formDesignerDeleteGroup(draft, draft.form.formElementGroups, index)));
    } else {
      this.setState(produce(draft => formDesignerDeleteFormElement(draft, draft.form.formElementGroups[index].formElements, elementIndex)));
    }
  }

  handleRegex(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        formDesignerHandleRegex(draft.form.formElementGroups[index].formElements[elementIndex], propertyName, value);
      })
    );
  }

  handleModeForDate(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        formDesignerHandleModeForDate(draft.form.formElementGroups[index].formElements[elementIndex], propertyName, value);
      })
    );
  }

  updateConceptElementData(index, propertyName, value, elementIndex = -1) {
    this.setState(
      produce(draft => {
        formDesignerUpdateConceptElementData(draft.form.formElementGroups[index].formElements[elementIndex], propertyName, value);
      })
    );
  }

  updateSkipLogicRule = (index, elementIndex, value) => {
    this.setState(
      produce(draft => {
        formDesignerHandleGroupElementChange(draft, draft.form.formElementGroups[index], "rule", value, elementIndex);
      })
    );
  };

  updateSkipLogicJSON = (index, elementIndex, value) => {
    this.setState(
      produce(draft => {
        formDesignerHandleGroupElementChange(draft, draft.form.formElementGroups[index], "declarativeRule", value, elementIndex);
      })
    );
  };

  updateFormElementGroupRule = (index, value) => {
    this.setState(
      produce(draft => {
        formDesignerHandleGroupElementChange(draft, draft.form.formElementGroups[index], "rule", value, -1);
      })
    );
  };

  updateFormElementGroupRuleJSON = (index, value) => {
    this.setState(
      produce(draft => {
        formDesignerHandleGroupElementChange(draft, draft.form.formElementGroups[index], "declarativeRule", value, -1);
      })
    );
  };

  onUpdateDragDropOrder = (groupSourceIndex, sourceElementIndex, destinationElementIndex, groupOrElement = 1, groupDestinationIndex) => {
    if (groupOrElement === 1) {
      this.setState(
        produce(draft => {
          const sourceElement = draft.form.formElementGroups[groupSourceIndex].formElements[sourceElementIndex];
          const destinationElement = draft.form.formElementGroups[groupDestinationIndex].formElements[destinationElementIndex];
          sourceElement.parentFormElementUuid = destinationElement.parentFormElementUuid;
          return formDesignerUpdateDragDropOrderForFirstGroup(
            draft,
            draft.form.formElementGroups[groupSourceIndex],
            draft.form.formElementGroups[groupDestinationIndex],
            groupSourceIndex,
            groupDestinationIndex,
            sourceElementIndex,
            destinationElementIndex
          );
        })
      );
    } else {
      let counter = 0;
      this.setState(
        produce(draft => {
          let form = draft.form;
          form.formElementGroups.forEach((element, index) => {
            if (!element.voided) {
              if (counter === destinationElementIndex) {
                const sourceElement = form.formElementGroups.splice(sourceElementIndex, 1)[0];
                form.formElementGroups.splice(index, 0, sourceElement);
              }
              counter += 1;
            }
          });
          draft.detectBrowserCloseEvent = true;
        })
      );
    }
  };

  getEntityNameForRules() {
    const entityFormInfo = FormTypeEntities[this.state.form.formType];
    if (_.isNil(entityFormInfo)) return "";
    return entityFormInfo.ruleVariableName;
  }

  renderGroups() {
    const formElements = [];
    _.forEach(this.state.form.formElementGroups, (group, index) => {
      if (!group.voided) {
        let propsGroup = {
          updateConceptElementData: this.updateConceptElementData,
          key: "Group" + index,
          groupData: group,
          index: index,
          deleteGroup: this.deleteGroup,
          btnGroupAdd: this.btnGroupAdd,
          identifierSources: this.state.identifierSources,
          groupSubjectTypes: this.state.groupSubjectTypes,
          onUpdateDragDropOrder: this.onUpdateDragDropOrder,
          handleGroupElementChange: this.handleGroupElementChange,
          handleGroupElementKeyValueChange: this.handleGroupElementKeyValueChange,
          handleExcludedAnswers: this.handleExcludedAnswers,
          updateSkipLogicRule: this.updateSkipLogicRule,
          updateSkipLogicJSON: this.updateSkipLogicJSON,
          updateFormElementGroupRuleJSON: this.updateFormElementGroupRuleJSON,
          handleModeForDate: this.handleModeForDate,
          handleRegex: this.handleRegex,
          handleConceptFormLibrary: this.handleConceptFormLibrary,
          onSaveInlineConcept: this.onSaveInlineConcept,
          handleInlineNumericAttributes: this.handleInlineNumericAttributes,
          handleInlineCodedConceptAnswers: this.handleInlineCodedConceptAnswers,
          onToggleInlineConceptCodedAnswerAttribute: this.onToggleInlineConceptCodedAnswerAttribute,
          onDeleteInlineConceptCodedAnswerDelete: this.onDeleteInlineConceptCodedAnswerDelete,
          onMoveUp: this.onMoveUp,
          onMoveDown: this.onMoveDown,
          onAlphabeticalSort: this.onAlphabeticalSort,
          handleInlineCodedAnswerAddition: this.handleInlineCodedAnswerAddition,
          handleInlineLocationAttributes: this.handleInlineLocationAttributes,
          handleInlineSubjectAttributes: this.handleInlineSubjectAttributes,
          handleInlineEncounterAttributes: this.handleInlineEncounterAttributes,
          handleInlinePhoneNumberAttributes: this.handleInlinePhoneNumberAttributes,
          updateFormElementGroupRule: this.updateFormElementGroupRule,
          entityName: this.getEntityNameForRules(),
          disableGroup: this.state.disableForm,
          subjectType: this.state.subjectType,
          form: this.state.form
        };
        formElements.push(<FormElementGroup {...propsGroup} />);
      }
    });
    return formElements;
  }

  handleExcludedAnswers = (name, status, index, elementIndex) => {
    this.setState(
      produce(draft =>
        formDesignerHandleExcludedAnswers(draft, draft.form.formElementGroups[index].formElements[elementIndex], name, status)
      )
    );
  };

  handleConceptFormLibrary = (index, value, elementIndex, inlineConcept = false) => {
    this.setState(
      produce(draft => {
        formDesignerHandleConceptFormLibrary(draft.form.formElementGroups[index].formElements[elementIndex], value, inlineConcept);
      })
    );
  };

  handleGroupElementKeyValueChange = (index, propertyName, value, elementIndex) => {
    this.setState(
      produce(draft =>
        formDesignerHandleGroupElementKeyValueChange(
          draft,
          draft.form.formElementGroups[index].formElements[elementIndex],
          propertyName,
          value
        )
      )
    );
  };

  handleGroupElementChange(index, propertyName, value, elementIndex = -1) {
    this.setState(
      produce(draft => formDesignerHandleGroupElementChange(draft, draft.form.formElementGroups[index], propertyName, value, elementIndex))
    );
  }

  handleInlineNumericAttributes(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        formDesignerHandleInlineNumericAttributes(draft.form.formElementGroups[index].formElements[elementIndex], propertyName, value);
      })
    );
  }

  handleInlineCodedConceptAnswers = (answerName, groupIndex, elementIndex, answerIndex) => {
    this.setState(
      produce(draft => {
        formDesignerHandleInlineCodedConceptAnswers(
          draft.form.formElementGroups[groupIndex].formElements[elementIndex],
          answerName,
          answerIndex
        );
      })
    );
  };

  handleInlineCodedAnswerAddition = (groupIndex, elementIndex) => {
    this.setState(
      produce(draft => formDesignerHandleInlineCodedAnswerAddition(draft.form.formElementGroups[groupIndex].formElements[elementIndex]))
    );
  };

  onToggleInlineConceptCodedAnswerAttribute = (propertyName, groupIndex, elementIndex, answerIndex) => {
    this.setState(
      produce(draft => {
        formDesignerOnToggleInlineConceptCodedAnswerAttribute(
          draft.form.formElementGroups[groupIndex].formElements[elementIndex],
          propertyName,
          answerIndex
        );
      })
    );
  };

  onDeleteInlineConceptCodedAnswerDelete = (groupIndex, elementIndex, answerIndex) => {
    this.setState(
      produce(draft => {
        formDesignerOnDeleteInlineConceptCodedAnswerDelete(
          draft.form.formElementGroups[groupIndex].formElements[elementIndex],
          answerIndex
        );
      })
    );
  };

  onMoveUp = (groupIndex, elementIndex, answerIndex) => {
    this.setState(
      produce(draft => {
        formDesignerOnConceptAnswerMoveUp(draft.form.formElementGroups[groupIndex].formElements[elementIndex], answerIndex);
      })
    );
  };

  onMoveDown = (groupIndex, elementIndex, answerIndex) => {
    this.setState(
      produce(draft => {
        formDesignerOnConceptAnswerMoveDown(draft.form.formElementGroups[groupIndex].formElements[elementIndex], answerIndex);
      })
    );
  };

  onAlphabeticalSort = (groupIndex, elementIndex) => {
    this.setState(
      produce(draft => formDesignerOnConceptAnswerAlphabeticalSort(draft.form.formElementGroups[groupIndex].formElements[elementIndex]))
    );
  };

  handleInlineLocationAttributes(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        formDesignerHandleInlineConceptAttributes(
          draft.form.formElementGroups[index].formElements[elementIndex],
          "inlineLocationDataTypeKeyValues",
          propertyName,
          value
        );
      })
    );
  }

  handleInlineSubjectAttributes(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        formDesignerHandleInlineConceptAttributes(
          draft.form.formElementGroups[index].formElements[elementIndex],
          "inlineSubjectDataTypeKeyValues",
          propertyName,
          value
        );
      })
    );
  }

  handleInlineEncounterAttributes(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        formDesignerHandleInlineConceptAttributes(
          draft.form.formElementGroups[index].formElements[elementIndex],
          "inlineEncounterDataTypeKeyValues",
          propertyName,
          value
        );
      })
    );
  }

  handleInlinePhoneNumberAttributes(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        formDesignerHandleInlineConceptAttributes(
          draft.form.formElementGroups[index].formElements[elementIndex],
          "inlinePhoneNumberDataTypeKeyValues",
          propertyName,
          value
        );
      })
    );
  }

  btnGroupAdd(index, elementIndex = -1) {
    this.setState(
      produce(draft => {
        if (elementIndex === -1) {
          formDesignerAddFormElementGroup(draft, draft.form.formElementGroups, index);
        } else {
          formDesignerAddFormElement(draft, draft.form.formElementGroups[index].formElements, elementIndex);
        }
      })
    );
  }

  btnGroupClick() {
    this.btnGroupAdd(0);
    this.setState({ createFlag: false });
  }

  getDeclarativeRuleValidationError(declarativeRule) {
    const declarativeRuleHolder = DeclarativeRuleHolder.fromResource(declarativeRule);
    const validationError = declarativeRuleHolder.validateAndGetError();
    return { declarativeRuleHolder, validationError };
  }

  validateFormLevelRules(form, declarativeRule, ruleKey, generateRuleFuncName) {
    const { declarativeRuleHolder, validationError } = this.getDeclarativeRuleValidationError(declarativeRule);
    if (!_.isEmpty(validationError)) {
      form.ruleError[ruleKey] = validationError;
      return true;
    } else if (!declarativeRuleHolder.isEmpty()) {
      form[ruleKey] = declarativeRuleHolder[generateRuleFuncName](this.getEntityNameForRules());
    }
  }

  // END Group level Events
  validateForm() {
    let flag = false;
    let errormsg = "";
    let numberGroupError = 0;
    let numberElementError = 0;
    this.setState(
      produce(draft => {
        draft.nameError = draft.name === "";
        draft.form.ruleError = {};
        const { validationDeclarativeRule, decisionDeclarativeRule, visitScheduleDeclarativeRule } = draft.form;
        const isValidationError = this.validateFormLevelRules(
          draft.form,
          validationDeclarativeRule,
          "validationRule",
          "generateFormValidationRule"
        );
        const isDecisionError = this.validateFormLevelRules(draft.form, decisionDeclarativeRule, "decisionRule", "generateDecisionRule");
        const isVisitScheduleError = this.validateFormLevelRules(
          draft.form,
          visitScheduleDeclarativeRule,
          "visitScheduleRule",
          "generateVisitScheduleRule"
        );
        flag = isValidationError || isDecisionError || isVisitScheduleError;
        _.forEach(draft.form.formElementGroups, group => {
          group.errorMessage = {};
          group.error = false;
          group.expanded = false;
          const { declarativeRuleHolder, validationError } = this.getDeclarativeRuleValidationError(group.declarativeRule);
          const isGroupNameEmpty = group.name.trim() === "";
          if (!group.voided && (isGroupNameEmpty || !_.isEmpty(validationError))) {
            group.error = true;
            flag = true;
            numberGroupError += 1;
            if (isGroupNameEmpty) group.errorMessage.name = true;
            if (!_.isEmpty(validationError)) group.errorMessage.ruleError = validationError;
          } else if (!declarativeRuleHolder.isEmpty()) {
            group.rule = declarativeRuleHolder.generateFormElementGroupRule(this.getEntityNameForRules());
          }
          let groupError = false;
          group.formElements.forEach(fe => {
            fe.errorMessage = {};
            fe.error = false;
            fe.expanded = false;
            if (fe.errorMessage) {
              Object.keys(fe.errorMessage).forEach(key => {
                fe.errorMessage[key] = false;
              });
            }
            const { declarativeRuleHolder, validationError } = this.getDeclarativeRuleValidationError(fe.declarativeRule);
            if (
              !fe.voided &&
              (fe.name === "" ||
                fe.concept.dataType === "" ||
                fe.concept.dataType === "NA" ||
                (fe.concept.dataType === "Coded" && fe.type === "") ||
                (fe.concept.dataType === "Video" && parseInt(fe.keyValues.durationLimitInSecs) < 0) ||
                (fe.concept.dataType === "Image" && parseInt(fe.keyValues.maxHeight) < 0) ||
                (fe.concept.dataType === "Image" && parseInt(fe.keyValues.maxWidth) < 0) ||
                !areValidFormatValuesValid(fe) ||
                !_.isEmpty(validationError))
            ) {
              numberElementError = numberElementError + 1;
              fe.error = true;

              fe.expanded = true;
              flag = groupError = true;
              if (fe.name === "") fe.errorMessage.name = true;
              if (fe.concept.dataType === "") fe.errorMessage.concept = true;
              if (fe.concept.dataType === "Coded" && fe.type === "") fe.errorMessage.type = true;
              if (fe.concept.dataType === "Video" && parseInt(fe.keyValues.durationLimitInSecs) < 0)
                fe.errorMessage.durationLimitInSecs = true;
              if (fe.concept.dataType === "Image" && parseInt(fe.keyValues.maxHeight) < 0) fe.errorMessage.maxHeight = true;
              if (fe.concept.dataType === "Image" && parseInt(fe.keyValues.maxWidth) < 0) fe.errorMessage.maxWidth = true;
              if (!areValidFormatValuesValid(fe)) fe.errorMessage.validFormat = true;
              if (!_.isEmpty(validationError)) {
                fe.errorMessage.ruleError = validationError;
              }
            } else if (!declarativeRuleHolder.isEmpty()) {
              fe.rule = declarativeRuleHolder.generateViewFilterRule(this.getEntityNameForRules());
            }
          });
          if (groupError || group.error) {
            group.expanded = true;
          }
        });
        if (flag) {
          if (numberGroupError !== 0) {
            errormsg += "There is a error in " + numberGroupError + " form group";
            if (numberElementError !== 0) errormsg += " and " + numberElementError + " form element.";
          } else if (numberElementError !== 0) errormsg += "There is a error in " + numberElementError + " form element.";
        }
        draft.saveCall = !flag;
        draft.errorMsg = errormsg;
      })
    );
  }

  updateForm = event => {
    /*Have to deep clone state.form here as we want to modify this data before we send it to server.
     * Modifying this data directly will give an error as Immer freezes the state object for direct modifications.
     */

    // this.setState({
    //   form: keyValueForm
    // });
    let dataSend = cloneDeep(this.state.form);
    dataSend.name = this.state.name;
    dataSend.timed = this.state.timed;
    _.forEach(dataSend.formElementGroups, (group, index) => {
      _.forEach(group.formElements, (element, index1) => {
        if (element.concept.dataType === "Coded") {
          const excluded = element.concept.answers.map(answer => {
            return answer.excluded && !answer.voided && answer.name;
          });
          const excludedAnswers = excluded.filter(obj => obj);
          if (!isEmpty(excludedAnswers)) {
            element.keyValues["ExcludedAnswers"] = excludedAnswers;
          } else if (element.keyValues["ExcludedAnswers"]) delete element.keyValues.ExcludedAnswers;
        }

        if (element.concept.dataType === "Video" && element.keyValues.durationLimitInSecs === "") {
          delete element.keyValues.durationLimitInSecs;
        }

        (element.concept.dataType === "Date" || element.concept.dataType === "Duration") &&
          element.keyValues["durationOptions"] &&
          element.keyValues["durationOptions"].length === 0 &&
          delete element.keyValues["durationOptions"];

        if (element.concept.dataType === "Image") {
          element.keyValues.maxHeight === "" && delete element.keyValues.maxHeight;
          element.keyValues.maxWidth === "" && delete element.keyValues.maxWidth;
        }

        if (element.validFormat && isEmpty(element.validFormat.regex) && isEmpty(element.validFormat.descriptionKey)) {
          delete element.validFormat;
        }

        if (Object.keys(element.keyValues).length !== 0) {
          const tempKeyValue = Object.keys(element.keyValues).map(keyValue => {
            return { key: keyValue, value: element.keyValues[keyValue] };
          });

          element.keyValues = tempKeyValue;
        } else {
          element.keyValues = [];
        }
      });
    });
    this.reOrderSequence(dataSend);
    _.forEach(dataSend.formElementGroups, (group, index) => {
      this.reOrderSequence(dataSend, index);
    });
    http
      .post("/forms", dataSend)
      .then(response => {
        if (response.status === 200) {
          this.setState({
            redirectToWorkflow: true,
            saveCall: false,
            successAlert: true,
            defaultSnackbarStatus: true,
            detectBrowserCloseEvent: false
          });
        }
      })
      .then(() => this.getForm())
      .catch(error => {
        this.setState({
          saveCall: false,
          errorMsg: "Server error received " + error.response.data
        });
      });
  };

  onDragEnd = result => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (result.type === "task") {
      const groupSourceIndex = result.source.droppableId.replace("Group", "");
      const groupDestinationIndex = result.destination.droppableId.replace("Group", "");
      const sourceElementIndex = result.source.index;
      const destinationElementIndex = result.destination.index;
      this.onUpdateDragDropOrder(groupSourceIndex, sourceElementIndex, destinationElementIndex, 1, groupDestinationIndex);
    } else {
      const groupSourceIndex = result.source.droppableId.replace("Group", "");
      const sourceElementIndex = result.draggableId.replace("Element", "");
      const destinationElementIndex = result.destination.index;
      this.onUpdateDragDropOrder(groupSourceIndex, sourceElementIndex, destinationElementIndex, 0, null);
    }
  };

  onRuleUpdate = (name, value) => {
    this.setState(
      produce(draft => {
        draft.form[name] = value;
        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  onDeclarativeRuleUpdate = (ruleName, json) => {
    this.setState(
      produce(draft => {
        draft.form[ruleName] = json;
        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  onDecisionConceptsUpdate = decisionConcepts => {
    this.setState(
      produce(draft => {
        draft.form.decisionConcepts = decisionConcepts;
        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  onSaveInlineConcept = (groupIndex, elementIndex) => {
    let clonedForm = cloneDeep(this.state.form);
    let clonedFormElement = clonedForm["formElementGroups"][groupIndex]["formElements"][elementIndex];
    const updateState = () => this.setState({ form: clonedForm });
    formDesignerOnSaveInlineConcept(clonedFormElement, updateState);
  };

  onToggleExpandPanel = name => {
    this.setState(
      produce(draft => {
        draft.form[name] = !draft.form[name];
      })
    );
  };

  render() {
    const hasFormEditPrivilege = UserInfo.hasFormEditPrivilege(this.props.userInfo, this.state.formType);
    const form = (
      <Grid container>
        <Grid container alignContent="flex-end">
          <Grid item sm={10}>
            {this.state.nameError && <FormHelperText error>Form name is empty</FormHelperText>}
            <TextField
              type="string"
              id="name"
              label="Form name"
              placeholder="Enter form name"
              margin="normal"
              onChange={event => this.onUpdateFormName(event.target.value)}
              value={this.state.name}
              style={{ width: "50%" }}
              autoComplete="off"
              disabled={this.state.disableForm}
            />
          </Grid>
          {this.state.createFlag && (
            <Grid item sm={2}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={this.btnGroupClick}
                style={{ marginTop: "30px", marginBottom: "2px" }}
                disabled={this.state.disableForm}
              >
                Add Group
              </Button>
            </Grid>
          )}

          {hasFormEditPrivilege && !this.state.createFlag && (
            <Grid item sm={2}>
              <SaveComponent
                name="Save"
                onSubmit={this.validateForm}
                styleClass={{
                  marginTop: "30px",
                  marginBottom: "2px"
                }}
                disabledFlag={!this.state.detectBrowserCloseEvent || this.state.disableForm}
                fullWidth={true}
              />
            </Grid>
          )}
          {!hasFormEditPrivilege && (
            <div
              style={{
                backgroundColor: "salmon",
                borderColor: "red",
                margin: "20px",
                padding: "15px",
                fontSize: 24,
                borderRadius: "5px"
              }}
            >
              You do not have access to edit this form. Changes will not be saved
            </div>
          )}
        </Grid>

        <Grid item sm={12}>
          <Tabs style={{ background: "#2196f3", color: "white" }} value={this.state.activeTabIndex} onChange={this.onTabHandleChange}>
            <Tab label="Details" />
            <Tab label="Rules" />
          </Tabs>
          <TabContainer hidden={this.state.activeTabIndex !== 0}>
            <Grid container item sm={12}>
              <Grid item sm={12}>
                {this.state.errorMsg !== "" && (
                  <FormControl fullWidth margin="dense">
                    <li style={{ color: "red" }}>{this.state.errorMsg}</li>
                  </FormControl>
                )}
              </Grid>
            </Grid>
            {this.state.formType === "IndividualProfile" && !_.isEmpty(getStaticFormElements(this.state.subjectType)) && (
              <div style={{ marginBottom: 30 }}>
                <StaticFormElementGroup
                  name={"First page questions (non editable)"}
                  formElements={getStaticFormElements(this.state.subjectType)}
                />
              </div>
            )}
            <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId="all-columns" direction="vertical" type="row">
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {this.renderGroups()}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <SystemInfo {...this.state.form} direction={"row"} />
            {/* </div> */}
          </TabContainer>

          <div hidden={this.state.activeTabIndex !== 1}>
            <FormLevelRules
              form={this.state.form}
              onRuleUpdate={this.onRuleUpdate}
              onDeclarativeRuleUpdate={this.onDeclarativeRuleUpdate}
              onDecisionConceptsUpdate={this.onDecisionConceptsUpdate}
              onToggleExpandPanel={this.onToggleExpandPanel}
              entityName={this.getEntityNameForRules()}
              disabled={this.state.disableForm}
              encounterTypes={this.state.encounterTypes}
            />
          </div>
        </Grid>
      </Grid>
    );
    let redirectTo = this.props.history.location.state;
    return (
      <FormDesignerContext.Provider
        value={{
          setState: newState => this.setState(newState),
          state: this.state
        }}
      >
        <Box boxShadow={2} p={3} bgcolor="background.paper">
          <Title title="Form Details" />

          {this.state.dataLoaded ? form : <div>Loading</div>}
          {this.state.redirectToWorkflow && redirectTo !== undefined && <Redirect to={`/appdesigner/${redirectTo.stateName}`} />}
          {this.state.successAlert && (
            <CustomizedSnackbar
              message="Successfully updated the form"
              getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
              defaultSnackbarStatus={this.state.defaultSnackbarStatus}
            />
          )}
          {this.state.saveCall && !this.state.nameError && this.updateForm()}
        </Box>
      </FormDesignerContext.Provider>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(FormDetails);
