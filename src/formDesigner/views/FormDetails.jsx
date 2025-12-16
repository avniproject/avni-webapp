import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import _, { cloneDeep, isEmpty, replace, split } from "lodash";
import { httpClient as http } from "common/utils/httpClient";
import { Grid, Button, FormControl } from "@mui/material";
import FormElementGroup from "../components/FormElementGroup";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { produce } from "immer";
import Box from "@mui/material/Box";
import { Title, useRecordContext } from "react-admin";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import { Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { SaveComponent } from "../../common/components/SaveComponent";
import FormLevelRules from "../components/FormLevelRules";
import { SystemInfo } from "../components/SystemInfo";
import StaticFormElementGroup from "../components/StaticFormElementGroup";
import { DeclarativeRuleHolder } from "rules-config";
import FormDesignerContext from "./FormDesignerContext";
import { useDifyFormValidation } from "../../custom-hooks/useDifyFormValidation";
import AiRuleCreationModal from "../components/AiRuleCreationModal";
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
  formDesignerUpdateDragDropOrderForFirstGroup,
} from "../common/FormDesignerHandlers";
import { FormTypeEntities } from "../common/constants";
import UserInfo from "../../common/model/UserInfo";
import { Concept } from "openchs-models";
import { SubjectTypeType } from "../../adminApp/SubjectType/Types";
import { multiSelectFormElementConceptDataTypes } from "../components/FormElementDetails";

export const isNumeric = (concept) => concept.dataType === "Numeric";

export const isText = (concept) => concept.dataType === "Text";

export const areValidFormatValuesValid = (formElement) => {
  if (!isNumeric(formElement.concept) && !isText(formElement.concept))
    return true;
  if (!formElement.validFormat) return true;
  return (
    isEmpty(formElement.validFormat.regex) ===
    isEmpty(formElement.validFormat.descriptionKey)
  );
};

export function TabContainer({ children, ...rest }) {
  const typographyCSS = { padding: 4 };
  return (
    <Typography {...rest} component="div" sx={typographyCSS}>
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const personStaticFormElements = [
  { name: "First name", dataType: Concept.dataType.Text },
  { name: "Last name", dataType: Concept.dataType.Text },
  { name: "Date of birth", dataType: Concept.dataType.Date },
  { name: "Age", dataType: Concept.dataType.Numeric },
  { name: "Gender", dataType: Concept.dataType.Coded },
  { name: "Address", dataType: Concept.dataType.Coded },
];

const nonPersonStaticFormElements = [
  { name: "Name", dataType: Concept.dataType.Text },
  { name: "Address", dataType: Concept.dataType.Coded },
];

const householdStaticFormElements = [
  { name: "Name", dataType: Concept.dataType.Text },
  { name: "Total members", dataType: Concept.dataType.Numeric },
  { name: "Address", dataType: Concept.dataType.Coded },
];

const userStaticFormElements = [
  { name: "First name", dataType: Concept.dataType.Text },
];

const getStaticFormElements = (subjectType) => {
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
};

const FormDetails = () => {
  const { uuid: formUUID } = useParams();
  const record = useRecordContext();
  const userInfo = useSelector((state) => state.app.userInfo);
  const aiConfig = useSelector((state) => state.app.genericConfig?.avniAi);

  const [state, setState] = useState({
    form: {},
    identifierSources: [],
    groupSubjectTypes: [],
    name: "",
    timed: false,
    errorMsg: "",
    createFlag: true,
    activeTabIndex: 0,
    successAlert: false,
    defaultSnackbarStatus: true,
    detectBrowserCloseEvent: false,
    nameError: false,
    redirectToWorkflow: false,
    availableDataTypes: [],
  });
  const multiSelectFormElementsToTypeMap = new Map();
  const questionGroupFormElementsToRepeatableMap = new Map();

  // Initialize Dify form validation hook
  const {
    validateFormElement,
    isLoading: isValidationLoading,
    clearValidationCache,
  } = useDifyFormValidation(
    state.form?.formType,
    aiConfig?.copilotFormValidationApiKey,
    state.form?.subjectType?.type,
  );

  // AI Rule Creation Modal state
  const [aiRuleModalOpen, setAiRuleModalOpen] = useState(false);
  const [aiRuleError, setAiRuleError] = useState(null);
  const pendingSuccessCallbackRef = useRef(null);
  const [scenariosContent, setScenariosContent] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Cleanup conversation state when component unmounts or form changes
  useEffect(() => {
    return () => {
      // Reset conversation state on cleanup
      pendingSuccessCallbackRef.current = null;
      setScenariosContent(null);
      setConversationHistory([]);
    };
  }, []);

  // Cleanup when form changes to prevent orphaned conversations
  useEffect(() => {
    if (state.form?.uuid) {
      // Reset conversation state when switching forms
      pendingSuccessCallbackRef.current = null;
      setScenariosContent(null);
      setConversationHistory([]);
      // Clear Dify conversation cache for fresh context on new form
      clearValidationCache();
    }
  }, [state.form?.uuid, clearValidationCache]);

  const onUpdateFormName = useCallback((name) => {
    setState((prev) => ({ ...prev, name, detectBrowserCloseEvent: true }));
  }, []);

  const onTabHandleChange = useCallback((event, value) => {
    setState((prev) => ({ ...prev, activeTabIndex: value }));
  }, []);

  const getDefaultSnackbarStatus = useCallback((defaultSnackbarStatus) => {
    setState((prev) => ({ ...prev, defaultSnackbarStatus }));
  }, []);

  const setupBeforeUnloadListener = useCallback(() => {
    const handler = (ev) => {
      ev.preventDefault();
      if (state.detectBrowserCloseEvent) {
        ev.returnValue = "Are you sure you want to close?";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.detectBrowserCloseEvent]);

  const getForm = useCallback(async () => {
    try {
      const response = await http.get(`/forms/export?formUUID=${formUUID}`);
      const form = response.data;

      form.visitScheduleRule = form.visitScheduleRule || "";
      form.decisionRule = form.decisionRule || "";
      form.validationRule = form.validationRule || "";
      form.checklistsRule = form.checklistsRule || "";
      form.decisionExpand = false;
      form.visitScheduleExpand = false;
      form.validationExpand = false;
      form.checklistExpand = false;

      _.forEach(form.formElementGroups, (group) => {
        group.groupId = (group.groupId || group.name).replace(
          /[^a-zA-Z0-9]/g,
          "_",
        );
        group.expanded = false;
        group.error = false;
        group.formElements.forEach((fe) => {
          fe.expanded = false;
          fe.error = false;
          fe.showConceptLibrary = "chooseFromLibrary";
          let keyValueObject = {};

          fe.keyValues.map((keyValue) => {
            keyValueObject[keyValue.key] = keyValue.value;
            return keyValue;
          });

          if (
            ["Date", "Duration"].includes(fe.concept.dataType) &&
            !Object.keys(keyValueObject).includes("durationOptions")
          ) {
            keyValueObject.durationOptions = [];
          }
          if (
            fe.concept.dataType === "Coded" &&
            keyValueObject.ExcludedAnswers !== undefined
          ) {
            _.forEach(fe.concept.answers, (answer) => {
              if (
                keyValueObject.ExcludedAnswers.includes(answer.name) &&
                !answer.voided
              ) {
                answer.excluded = true;
              }
            });
          }

          if (
            _.includes(
              multiSelectFormElementConceptDataTypes,
              fe.concept.dataType,
            )
          ) {
            multiSelectFormElementsToTypeMap.set(fe.uuid, fe.type);
          }
          if (fe.concept.dataType === "QuestionGroup") {
            questionGroupFormElementsToRepeatableMap.set(
              fe.uuid,
              keyValueObject.repeatable,
            );
          }
          fe.keyValues = keyValueObject;
        });
      });

      const dataGroupFlag = countGroupElements(form);
      setState((prev) => ({
        ...prev,
        form,
        name: form.name,
        timed: form.timed,
        createFlag: dataGroupFlag,
        formType: form.formType,
        subjectType: form.subjectType,
        disableForm: form.organisationId === 1,
        dataLoaded: true,
      }));

      if (dataGroupFlag) {
        btnGroupClick();
      }
    } catch {
      setState((prev) => ({ ...prev, errorMsg: "Failed to load form data" }));
    }
  }, [formUUID]);

  const countGroupElements = useCallback((form) => {
    return _.every(
      form.formElementGroups,
      (groupElement) => groupElement.voided,
    );
  }, []);

  const reOrderSequence = useCallback((form, index = -1) => {
    if (index <= -1) {
      _.forEach(form.formElementGroups, (group, ind) => {
        group.displayOrder = ind + 1;
      });
    } else {
      _.forEach(form.formElementGroups[index].formElements, (element, ind) => {
        element.displayOrder = ind + 1;
      });
    }
  }, []);

  const deleteGroup = useCallback((index, elementIndex = -1) => {
    setState(
      produce((draft) => {
        if (elementIndex === -1) {
          formDesignerDeleteGroup(draft, draft.form.formElementGroups, index);
        } else {
          formDesignerDeleteFormElement(
            draft,
            draft.form.formElementGroups[index].formElements,
            elementIndex,
          );
        }
      }),
    );
  }, []);

  const handleRegex = useCallback(
    (index, propertyName, value, elementIndex) => {
      setState(
        produce((draft) => {
          formDesignerHandleRegex(
            draft.form.formElementGroups[index].formElements[elementIndex],
            propertyName,
            value,
          );
        }),
      );
    },
    [],
  );

  const handleModeForDate = useCallback(
    (index, propertyName, value, elementIndex) => {
      setState(
        produce((draft) => {
          formDesignerHandleModeForDate(
            draft.form.formElementGroups[index].formElements[elementIndex],
            propertyName,
            value,
          );
        }),
      );
    },
    [],
  );

  const updateConceptElementData = useCallback(
    (index, propertyName, value, elementIndex = -1) => {
      setState(
        produce((draft) => {
          formDesignerUpdateConceptElementData(
            draft.form.formElementGroups[index].formElements[elementIndex],
            propertyName,
            value,
          );
        }),
      );
    },
    [],
  );

  const updateSkipLogicRule = useCallback((index, elementIndex, value) => {
    setState(
      produce((draft) => {
        formDesignerHandleGroupElementChange(
          draft,
          draft.form.formElementGroups[index],
          "rule",
          value,
          elementIndex,
        );
      }),
    );
  }, []);

  const updateSkipLogicJSON = useCallback((index, elementIndex, value) => {
    setState(
      produce((draft) => {
        formDesignerHandleGroupElementChange(
          draft,
          draft.form.formElementGroups[index],
          "declarativeRule",
          value,
          elementIndex,
        );
      }),
    );
  }, []);

  const updateFormElementGroupRule = useCallback((index, value) => {
    setState(
      produce((draft) => {
        formDesignerHandleGroupElementChange(
          draft,
          draft.form.formElementGroups[index],
          "rule",
          value,
          -1,
        );
      }),
    );
  }, []);

  const updateFormElementGroupRuleJSON = useCallback((index, value) => {
    setState(
      produce((draft) => {
        formDesignerHandleGroupElementChange(
          draft,
          draft.form.formElementGroups[index],
          "declarativeRule",
          value,
          -1,
        );
      }),
    );
  }, []);

  const onUpdateDragDropOrder = useCallback(
    (
      groupSourceIndex,
      sourceElementIndex,
      destinationElementIndex,
      groupOrElement = 1,
      groupDestinationIndex,
    ) => {
      setState(
        produce((draft) => {
          if (groupOrElement === 1) {
            const sourceElement =
              draft.form.formElementGroups[groupSourceIndex].formElements[
                sourceElementIndex
              ];
            const destinationElement =
              draft.form.formElementGroups[groupDestinationIndex].formElements[
                destinationElementIndex
              ];
            sourceElement.parentFormElementUuid =
              destinationElement.parentFormElementUuid;
            formDesignerUpdateDragDropOrderForFirstGroup(
              draft,
              draft.form.formElementGroups[groupSourceIndex],
              draft.form.formElementGroups[groupDestinationIndex],
              groupSourceIndex,
              groupDestinationIndex,
              sourceElementIndex,
              destinationElementIndex,
            );
          } else {
            let counter = 0;
            let form = draft.form;
            form.formElementGroups.forEach((element, index) => {
              if (!element.voided) {
                if (counter === destinationElementIndex) {
                  const sourceElement = form.formElementGroups.splice(
                    sourceElementIndex,
                    1,
                  )[0];
                  form.formElementGroups.splice(index, 0, sourceElement);
                }
                counter += 1;
              }
            });
            draft.detectBrowserCloseEvent = true;
          }
        }),
      );
    },
    [],
  );

  const getEntityNameForRules = useCallback(() => {
    const entityFormInfo = FormTypeEntities[state.form.formType];
    return entityFormInfo ? entityFormInfo.ruleVariableName : "";
  }, [state.form.formType]);

  const renderGroups = useCallback(() => {
    const formElements = [];
    _.forEach(state.form.formElementGroups, (group, index) => {
      if (!group.voided) {
        const propsGroup = {
          updateConceptElementData,
          key: `Group${index}`,
          groupData: group,
          index,
          deleteGroup,
          btnGroupAdd,
          identifierSources: state.identifierSources,
          groupSubjectTypes: state.groupSubjectTypes,
          onUpdateDragDropOrder,
          handleGroupElementChange,
          handleGroupElementKeyValueChange,
          handleExcludedAnswers,
          updateSkipLogicRule,
          updateSkipLogicJSON,
          updateFormElementGroupRuleJSON,
          handleModeForDate,
          handleRegex,
          handleConceptFormLibrary,
          onSaveInlineConcept,
          handleInlineNumericAttributes,
          handleInlineCodedConceptAnswers,
          onToggleInlineConceptCodedAnswerAttribute,
          onDeleteInlineConceptCodedAnswerDelete,
          onMoveUp,
          onMoveDown,
          onAlphabeticalSort,
          handleInlineCodedAnswerAddition,
          handleInlineLocationAttributes,
          handleInlineSubjectAttributes,
          handleInlineEncounterAttributes,
          handleInlinePhoneNumberAttributes,
          updateFormElementGroupRule,
          generateWarningFromLLM,
          entityName: getEntityNameForRules(),
          disableGroup: state.disableForm,
          subjectType: state.subjectType,
          form: state.form,
        };
        formElements.push(<FormElementGroup {...propsGroup} />);
      }
    });
    return formElements;
  }, [
    state.form.formElementGroups,
    state.identifierSources,
    state.groupSubjectTypes,
    state.disableForm,
    state.subjectType,
    state.form,
  ]);

  const handleExcludedAnswers = useCallback(
    (name, status, index, elementIndex) => {
      setState(
        produce((draft) =>
          formDesignerHandleExcludedAnswers(
            draft,
            draft.form.formElementGroups[index].formElements[elementIndex],
            name,
            status,
          ),
        ),
      );
    },
    [],
  );

  const handleConceptFormLibrary = useCallback(
    (index, value, elementIndex, inlineConcept = false) => {
      setState(
        produce((draft) => {
          formDesignerHandleConceptFormLibrary(
            draft.form.formElementGroups[index].formElements[elementIndex],
            value,
            inlineConcept,
          );
        }),
      );
    },
    [],
  );

  const handleGroupElementKeyValueChange = useCallback(
    (index, propertyName, value, elementIndex) => {
      setState(
        produce((draft) =>
          formDesignerHandleGroupElementKeyValueChange(
            draft,
            draft.form.formElementGroups[index].formElements[elementIndex],
            propertyName,
            value,
          ),
        ),
      );
    },
    [],
  );

  const generateWarningFromLLM = useCallback(
    async (formElement, entireForm, groupIndex, elementIndex) => {
      const handleValidationResult = (warningMessage) => {
        setState(
          produce((draft) => {
            draft.form.formElementGroups[groupIndex].formElements[
              elementIndex
            ].warning = warningMessage;
          }),
        );
      };

      validateFormElement(formElement, handleValidationResult);
    },
    [validateFormElement],
  );

  const handleGroupElementChange = useCallback(
    (index, propertyName, value, elementIndex = -1) => {
      setState(
        produce((draft) =>
          formDesignerHandleGroupElementChange(
            draft,
            draft.form.formElementGroups[index],
            propertyName,
            value,
            elementIndex,
          ),
        ),
      );

      // Trigger LLM call for form element changes (exclude UI-only properties)
      if (
        elementIndex !== -1 &&
        !["display", "expand"].includes(propertyName)
      ) {
        // Get current form element and apply the new change to avoid stale state
        const currentFormElement =
          state.form.formElementGroups[index]?.formElements[elementIndex];
        if (currentFormElement) {
          const updatedFormElement = {
            ...currentFormElement,
            [propertyName]: value,
          };

          if (updatedFormElement?.name && updatedFormElement?.concept?.name) {
            generateWarningFromLLM(
              updatedFormElement,
              state.form,
              index,
              elementIndex,
            );
          }
        }
      }
    },
    [state.form, generateWarningFromLLM],
  );

  const handleInlineNumericAttributes = useCallback(
    (index, propertyName, value, elementIndex) => {
      setState(
        produce((draft) => {
          formDesignerHandleInlineNumericAttributes(
            draft.form.formElementGroups[index].formElements[elementIndex],
            propertyName,
            value,
          );
        }),
      );
    },
    [],
  );

  const handleInlineCodedConceptAnswers = useCallback(
    (answerName, groupIndex, elementIndex, answerIndex) => {
      setState(
        produce((draft) => {
          formDesignerHandleInlineCodedConceptAnswers(
            draft.form.formElementGroups[groupIndex].formElements[elementIndex],
            answerName,
            answerIndex,
          );
        }),
      );
    },
    [],
  );

  const handleInlineCodedAnswerAddition = useCallback(
    (groupIndex, elementIndex) => {
      setState(
        produce((draft) =>
          formDesignerHandleInlineCodedAnswerAddition(
            draft.form.formElementGroups[groupIndex].formElements[elementIndex],
          ),
        ),
      );
    },
    [],
  );

  const onToggleInlineConceptCodedAnswerAttribute = useCallback(
    (propertyName, groupIndex, elementIndex, answerIndex) => {
      setState(
        produce((draft) => {
          formDesignerOnToggleInlineConceptCodedAnswerAttribute(
            draft.form.formElementGroups[groupIndex].formElements[elementIndex],
            propertyName,
            answerIndex,
          );
        }),
      );
    },
    [],
  );

  const onDeleteInlineConceptCodedAnswerDelete = useCallback(
    (groupIndex, elementIndex, answerIndex) => {
      setState(
        produce((draft) => {
          formDesignerOnDeleteInlineConceptCodedAnswerDelete(
            draft.form.formElementGroups[groupIndex].formElements[elementIndex],
            answerIndex,
          );
        }),
      );
    },
    [],
  );

  const onMoveUp = useCallback((groupIndex, elementIndex, answerIndex) => {
    setState(
      produce((draft) => {
        formDesignerOnConceptAnswerMoveUp(
          draft.form.formElementGroups[groupIndex].formElements[elementIndex],
          answerIndex,
        );
      }),
    );
  }, []);

  const onMoveDown = useCallback((groupIndex, elementIndex, answerIndex) => {
    setState(
      produce((draft) => {
        formDesignerOnConceptAnswerMoveDown(
          draft.form.formElementGroups[groupIndex].formElements[elementIndex],
          answerIndex,
        );
      }),
    );
  }, []);

  const onAlphabeticalSort = useCallback((groupIndex, elementIndex) => {
    setState(
      produce((draft) =>
        formDesignerOnConceptAnswerAlphabeticalSort(
          draft.form.formElementGroups[groupIndex].formElements[elementIndex],
        ),
      ),
    );
  }, []);

  const handleInlineLocationAttributes = useCallback(
    (index, propertyName, value, elementIndex) => {
      setState(
        produce((draft) => {
          formDesignerHandleInlineConceptAttributes(
            draft.form.formElementGroups[index].formElements[elementIndex],
            "inlineLocationDataTypeKeyValues",
            propertyName,
            value,
          );
        }),
      );
    },
    [],
  );

  const handleInlineSubjectAttributes = useCallback(
    (index, propertyName, value, elementIndex) => {
      setState(
        produce((draft) => {
          formDesignerHandleInlineConceptAttributes(
            draft.form.formElementGroups[index].formElements[elementIndex],
            "inlineSubjectDataTypeKeyValues",
            propertyName,
            value,
          );
        }),
      );
    },
    [],
  );

  const handleInlineEncounterAttributes = useCallback(
    (index, propertyName, value, elementIndex) => {
      setState(
        produce((draft) => {
          formDesignerHandleInlineConceptAttributes(
            draft.form.formElementGroups[index].formElements[elementIndex],
            "inlineEncounterDataTypeKeyValues",
            propertyName,
            value,
          );
        }),
      );
    },
    [],
  );

  const handleInlinePhoneNumberAttributes = useCallback(
    (index, propertyName, value, elementIndex) => {
      setState(
        produce((draft) => {
          formDesignerHandleInlineConceptAttributes(
            draft.form.formElementGroups[index].formElements[elementIndex],
            "inlinePhoneNumberDataTypeKeyValues",
            propertyName,
            value,
          );
        }),
      );
    },
    [],
  );

  const btnGroupAdd = useCallback((index, elementIndex = -1) => {
    setState(
      produce((draft) => {
        if (elementIndex === -1) {
          formDesignerAddFormElementGroup(
            draft,
            draft.form.formElementGroups,
            index,
          );
        } else {
          formDesignerAddFormElement(
            draft,
            draft.form.formElementGroups[index].formElements,
            elementIndex,
          );
        }
      }),
    );
  }, []);

  const btnGroupClick = useCallback(() => {
    btnGroupAdd(0);
    setState((prev) => ({ ...prev, createFlag: false }));
  }, [btnGroupAdd]);

  const getDeclarativeRuleValidationError = useCallback((declarativeRule) => {
    const declarativeRuleHolder =
      DeclarativeRuleHolder.fromResource(declarativeRule);
    const validationError = declarativeRuleHolder.validateAndGetError();
    return { declarativeRuleHolder, validationError };
  }, []);

  const getDisallowedChangesError = useCallback((formElement) => {
    const currentType = multiSelectFormElementsToTypeMap.get(formElement.uuid);
    const currentRepeatability = questionGroupFormElementsToRepeatableMap.get(
      formElement.uuid,
    );
    return (
      (multiSelectFormElementsToTypeMap.has(formElement.uuid) &&
        !!currentType !== !!formElement.type) ||
      (questionGroupFormElementsToRepeatableMap.has(formElement.uuid) &&
        !!currentRepeatability !== !!formElement.keyValues.repeatable)
    );
  }, []);

  const validateFormLevelRules = useCallback(
    (form, declarativeRule, ruleKey, generateRuleFuncName) => {
      const { declarativeRuleHolder, validationError } =
        getDeclarativeRuleValidationError(declarativeRule);
      if (!_.isEmpty(validationError)) {
        form.ruleError[ruleKey] = validationError;
        return true;
      } else if (!declarativeRuleHolder.isEmpty()) {
        form[ruleKey] = declarativeRuleHolder[generateRuleFuncName](
          getEntityNameForRules(),
        );
      }
      return false;
    },
    [getDeclarativeRuleValidationError, getEntityNameForRules],
  );

  const validateForm = useCallback(() => {
    let flag = false;
    let errormsg = "";
    let numberGroupError = 0;
    let numberElementError = 0;

    setState(
      produce((draft) => {
        draft.nameError = draft.name === "";
        draft.form.ruleError = {};
        const {
          validationDeclarativeRule,
          decisionDeclarativeRule,
          visitScheduleDeclarativeRule,
        } = draft.form;
        const isValidationError = validateFormLevelRules(
          draft.form,
          validationDeclarativeRule,
          "validationRule",
          "generateFormValidationRule",
        );
        const isDecisionError = validateFormLevelRules(
          draft.form,
          decisionDeclarativeRule,
          "decisionRule",
          "generateDecisionRule",
        );
        const isVisitScheduleError = validateFormLevelRules(
          draft.form,
          visitScheduleDeclarativeRule,
          "visitScheduleRule",
          "generateVisitScheduleRule",
        );
        flag =
          isValidationError ||
          isDecisionError ||
          isVisitScheduleError ||
          draft.nameError;
        _.forEach(draft.form.formElementGroups, (group) => {
          group.errorMessage = {};
          group.error = false;
          group.expanded = false;
          const { declarativeRuleHolder, validationError } =
            getDeclarativeRuleValidationError(group.declarativeRule);
          const isGroupNameEmpty = group.name.trim() === "";
          if (
            !group.voided &&
            (isGroupNameEmpty || !_.isEmpty(validationError))
          ) {
            group.error = true;
            flag = true;
            numberGroupError += 1;
            if (isGroupNameEmpty) group.errorMessage.name = true;
            if (!_.isEmpty(validationError))
              group.errorMessage.ruleError = validationError;
          } else if (!declarativeRuleHolder.isEmpty()) {
            group.rule = declarativeRuleHolder.generateFormElementGroupRule(
              getEntityNameForRules(),
            );
          }
          let groupError = false;
          group.formElements.forEach((fe) => {
            fe.errorMessage = {};
            fe.error = false;
            fe.expanded = false;
            if (fe.errorMessage) {
              Object.keys(fe.errorMessage).forEach((key) => {
                fe.errorMessage[key] = false;
              });
            }
            const { declarativeRuleHolder, validationError } =
              getDeclarativeRuleValidationError(fe.declarativeRule);
            const disallowedChangeError = getDisallowedChangesError(fe);
            if (
              !fe.voided &&
              (fe.name === "" ||
                fe.concept.dataType === "" ||
                fe.concept.dataType === "NA" ||
                (fe.concept.dataType === "Coded" && fe.type === "") ||
                (fe.concept.dataType === "Video" &&
                  parseInt(fe.keyValues.durationLimitInSecs) < 0) ||
                (fe.concept.dataType === "Image" &&
                  parseInt(fe.keyValues.maxHeight) < 0) ||
                (fe.concept.dataType === "Image" &&
                  parseInt(fe.keyValues.maxWidth) < 0) ||
                !areValidFormatValuesValid(fe) ||
                !_.isEmpty(validationError) ||
                disallowedChangeError)
            ) {
              numberElementError += 1;
              fe.error = true;
              fe.expanded = true;
              flag = groupError = true;
              if (fe.name === "") fe.errorMessage.name = true;
              if (fe.concept.dataType === "") fe.errorMessage.concept = true;
              if (fe.concept.dataType === "Coded" && fe.type === "")
                fe.errorMessage.type = true;
              if (
                fe.concept.dataType === "Video" &&
                parseInt(fe.keyValues.durationLimitInSecs) < 0
              )
                fe.errorMessage.durationLimitInSecs = true;
              if (
                fe.concept.dataType === "Image" &&
                parseInt(fe.keyValues.maxHeight) < 0
              )
                fe.errorMessage.maxHeight = true;
              if (
                fe.concept.dataType === "Image" &&
                parseInt(fe.keyValues.maxWidth) < 0
              )
                fe.errorMessage.maxWidth = true;
              if (!areValidFormatValuesValid(fe))
                fe.errorMessage.validFormat = true;
              if (!_.isEmpty(validationError)) {
                fe.errorMessage.ruleError = validationError;
              }
              if (disallowedChangeError) {
                fe.errorMessage.disallowedChangeError = true;
              }
            } else if (
              !fe.voided &&
              fe.concept.dataType === "Duration" &&
              (!fe.keyValues.durationOptions ||
                fe.keyValues.durationOptions.length === 0)
            ) {
              fe.error = true;
              fe.expanded = true;
              fe.errorMessage.durationOptions = true;
              flag = groupError = true;
              numberElementError += 1;
            } else if (!declarativeRuleHolder.isEmpty()) {
              fe.rule = declarativeRuleHolder.generateViewFilterRule(
                getEntityNameForRules(),
              );
            }
          });
          if (groupError || group.error) {
            group.expanded = true;
          }
        });
        if (flag) {
          if (numberGroupError !== 0) {
            errormsg += `There is an error in ${numberGroupError} form group`;
            if (numberElementError !== 0)
              errormsg += ` and ${numberElementError} form element.`;
          } else if (numberElementError !== 0)
            errormsg += `There is an error in ${numberElementError} form element.`;
        }
        draft.errorMsg = errormsg;
        // Store the validation result in the draft to trigger useEffect
        draft.shouldCallUpdateForm = !flag;
      }),
    );
  }, [
    getDeclarativeRuleValidationError,
    getDisallowedChangesError,
    getEntityNameForRules,
  ]);

  const updateForm = useCallback(async () => {
    let dataSend = cloneDeep(state.form);
    dataSend.name = state.name;
    dataSend.timed = state.timed;
    _.forEach(dataSend.formElementGroups, (group) => {
      _.forEach(group.formElements, (element) => {
        if (element.concept.dataType === "Coded") {
          const excluded = element.concept.answers
            .map((answer) => answer.excluded && !answer.voided && answer.name)
            .filter((obj) => obj);
          if (!isEmpty(excluded)) {
            element.keyValues.ExcludedAnswers = excluded;
          } else if (element.keyValues.ExcludedAnswers) {
            delete element.keyValues.ExcludedAnswers;
          }
        }
        if (
          element.concept.dataType === "Video" &&
          element.keyValues.durationLimitInSecs === ""
        ) {
          delete element.keyValues.durationLimitInSecs;
        }
        if (
          (element.concept.dataType === "Date" ||
            element.concept.dataType === "Duration") &&
          element.keyValues.durationOptions?.length === 0
        ) {
          delete element.keyValues.durationOptions;
        }
        if (element.concept.dataType === "Image") {
          if (element.keyValues.maxHeight === "")
            delete element.keyValues.maxHeight;
          if (element.keyValues.maxWidth === "")
            delete element.keyValues.maxWidth;
        }
        if (
          element.validFormat &&
          isEmpty(element.validFormat.regex) &&
          isEmpty(element.validFormat.descriptionKey)
        ) {
          delete element.validFormat;
        }
        if (Object.keys(element.keyValues).length !== 0) {
          element.keyValues = Object.keys(element.keyValues).map((key) => ({
            key,
            value: element.keyValues[key],
          }));
        } else {
          element.keyValues = [];
        }
      });
    });
    reOrderSequence(dataSend);
    _.forEach(dataSend.formElementGroups, (group, index) => {
      reOrderSequence(dataSend, index);
    });
    try {
      const response = await http.post("/forms", dataSend);
      if (response.status === 200) {
        setState((prev) => ({
          ...prev,
          redirectToWorkflow: true,
          successAlert: true,
          defaultSnackbarStatus: true,
          detectBrowserCloseEvent: false,
        }));
        await getForm();
      }
    } catch (error) {
      const errorMessage = split(
        replace(error.response.data, /^org\..*: /, ""),
        /\n|\r/,
        1,
      );
      setState((prev) => ({
        ...prev,
        errorMsg: `Server error received: ${errorMessage}`,
      }));
    }
  }, [state.form, state.name, state.timed, reOrderSequence, getForm]);

  useEffect(() => {
    if (state.shouldCallUpdateForm) {
      updateForm();
      // Reset the flag to prevent repeated calls
      setState((prev) => ({ ...prev, shouldCallUpdateForm: false }));
    }
  }, [state.shouldCallUpdateForm, updateForm]);

  const onDragEnd = useCallback(
    (result) => {
      const { destination, source } = result;
      if (
        !destination ||
        (destination.droppableId === source.droppableId &&
          destination.index === source.index)
      ) {
        return;
      }
      if (result.type === "task") {
        const sourceGroupUuid = result.source.droppableId.replace("Group", "");
        const destGroupUuid = result.destination.droppableId.replace(
          "Group",
          "",
        );
        const groupSourceIndex = state.form.formElementGroups.findIndex(
          (g) => g.uuid === sourceGroupUuid,
        );
        const groupDestinationIndex = state.form.formElementGroups.findIndex(
          (g) => g.uuid === destGroupUuid,
        );
        if (groupSourceIndex === -1 || groupDestinationIndex === -1) return;
        const elementUuid = result.draggableId.split("Element")[1];
        const sourceElementIndex = state.form.formElementGroups[
          groupSourceIndex
        ].formElements.findIndex((fe) => fe.uuid === elementUuid);
        const destinationElementIndex = result.destination.index;
        if (sourceElementIndex === -1) return;
        onUpdateDragDropOrder(
          groupSourceIndex,
          sourceElementIndex,
          destinationElementIndex,
          1,
          groupDestinationIndex,
        );
      } else {
        const groupUuid = result.draggableId.replace("Group", "");
        const sourceElementIndex = state.form.formElementGroups.findIndex(
          (g) => g.uuid === groupUuid,
        );
        const destinationElementIndex = result.destination.index;
        if (sourceElementIndex === -1) return;
        onUpdateDragDropOrder(
          null,
          sourceElementIndex,
          destinationElementIndex,
          0,
          null,
        );
      }
    },
    [state.form.formElementGroups, onUpdateDragDropOrder],
  );

  const onRuleUpdate = useCallback((name, value) => {
    setState(
      produce((draft) => {
        draft.form[name] = value;
        draft.detectBrowserCloseEvent = true;
      }),
    );
  }, []);

  const handleAiRuleCreation = useCallback(
    async (requirements, ruleType = "VisitSchedule") => {
      // Prevent duplicate API calls while one is in progress
      if (isValidationLoading) {
        return;
      }

      setAiRuleError(null); // Clear any previous errors

      // Add user message to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          role: "user",
          content: requirements,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Set the success callback BEFORE making the API call - using ref for immediate access
      pendingSuccessCallbackRef.current = (code) => {
        onRuleUpdate("visitScheduleRule", code);
      };

      const handleRuleGeneration = (response) => {
        // Handle structured response from validation service
        if (response && typeof response === "object" && response.type) {
          if (response.type === "scenarios") {
            // This is a scenarios response - show scenarios
            setScenariosContent(response.content);

            // Add AI scenarios response to conversation history
            setConversationHistory((prev) => [
              ...prev,
              {
                role: "assistant",
                content: response.content,
                type: "scenarios",
                timestamp: new Date().toISOString(),
              },
            ]);
            return;
          } else if (response.type === "code") {
            // This is final code - route to JSEditor via pending callback
            if (pendingSuccessCallbackRef.current) {
              pendingSuccessCallbackRef.current(response.content);
            }

            // Add AI code response to conversation history
            setConversationHistory((prev) => [
              ...prev,
              {
                role: "assistant",
                content: response.content,
                type: "code",
                timestamp: new Date().toISOString(),
              },
            ]);

            // Show success briefly before closing
            setScenariosContent(
              "✅ Rule generated successfully! The code has been added to the editor.",
            );
            setTimeout(() => {
              setAiRuleModalOpen(false);
              setAiRuleError(null);
              pendingSuccessCallbackRef.current = null;
              setScenariosContent(null);
            }, 2000);
            return;
          }
        }

        // Fallback for non-structured responses (backward compatibility)
        if (typeof response === "string") {
          if (response.includes("({params, imports}) =>")) {
            // This is final code
            if (pendingSuccessCallbackRef.current) {
              pendingSuccessCallbackRef.current(response);
            }

            // Add AI code response to conversation history
            setConversationHistory((prev) => [
              ...prev,
              {
                role: "assistant",
                content: response,
                type: "code",
                timestamp: new Date().toISOString(),
              },
            ]);

            // Show success briefly before closing
            setScenariosContent(
              "✅ Rule generated successfully! The code has been added to the editor.",
            );
            setTimeout(() => {
              setAiRuleModalOpen(false);
              setAiRuleError(null);
              pendingSuccessCallbackRef.current = null;
              setScenariosContent(null);
            }, 2000);
          }
        }
      };

      // Build context for VisitSchedule requests
      const buildVisitScheduleContext = () => {
        const form_context = {
          formType: state.form?.formType || "Unknown",
        };

        // For registration forms (IndividualProfile): Include current subject type being registered
        if (state.form?.subjectType) {
          form_context.currentSubjectType =
            typeof state.form.subjectType === "object"
              ? state.form.subjectType.name
              : state.form.subjectType;
        }

        // For enrolment forms (ProgramEnrolment): Include current program being enrolled into
        // Resolved from form mappings and stored in state
        if (state.currentProgram) {
          form_context.currentProgram = state.currentProgram;
        }

        // For encounter forms (ProgramEncounter / Encounter): Include current encounter type being used
        // Resolved from form mappings and stored in state
        if (state.currentEncounterType) {
          form_context.currentEncounterType = state.currentEncounterType;
        }

        // Add all available subject types (from operational modules)
        if (state.subjectTypes && state.subjectTypes.length > 0) {
          form_context.subjectTypes = state.subjectTypes.map((st) => st.name);
        }

        // Add all available programs (from operational modules)
        if (state.programs && state.programs.length > 0) {
          form_context.programs = state.programs.map(
            (p) => p.name || p.operationalProgramName,
          );
        }

        // Add all available encounter types (from operational modules)
        if (state.encounterTypes && state.encounterTypes.length > 0) {
          form_context.encounterTypes = state.encounterTypes.map((et) => ({
            name: et.name,
            program: et.programName || et.program,
          }));
        }

        // Extract concept names from form elements
        if (state.form?.formElementGroups) {
          const conceptNames = [];
          state.form.formElementGroups.forEach((group) => {
            if (!group.voided && group.formElements) {
              group.formElements.forEach((fe) => {
                if (!fe.voided && fe.concept?.name) {
                  conceptNames.push(fe.concept.name);
                }
              });
            }
          });
          if (conceptNames.length > 0) {
            form_context.concepts = conceptNames;
          }
        }

        return form_context;
      };

      // Create a form element-like object for the API
      const ruleRequest = {
        name: `${ruleType} Rule`,
        requirements,
        form_context:
          ruleType === "VisitSchedule"
            ? JSON.stringify(buildVisitScheduleContext())
            : "{}",
      };

      try {
        validateFormElement(ruleRequest, handleRuleGeneration, ruleType);
      } catch (error) {
        console.error("AI rule creation failed:", error);
        setAiRuleError("Failed to generate rule. Please try again.");
      }
    },
    [
      validateFormElement,
      onRuleUpdate,
      isValidationLoading,
      state.form,
      state.subjectTypes,
      state.programs,
      state.encounterTypes,
      state.currentProgram,
      state.currentEncounterType,
    ],
  );

  const onDeclarativeRuleUpdate = useCallback((ruleName, json) => {
    setState(
      produce((draft) => {
        draft.form[ruleName] = json;
        draft.detectBrowserCloseEvent = true;
      }),
    );
  }, []);

  const onDecisionConceptsUpdate = useCallback((decisionConcepts) => {
    setState(
      produce((draft) => {
        draft.form.decisionConcepts = decisionConcepts;
        draft.detectBrowserCloseEvent = true;
      }),
    );
  }, []);

  const onSaveInlineConcept = useCallback(
    (groupIndex, elementIndex) => {
      let clonedForm = cloneDeep(state.form);
      let clonedFormElement =
        clonedForm.formElementGroups[groupIndex].formElements[elementIndex];
      formDesignerOnSaveInlineConcept(clonedFormElement, () =>
        setState((prev) => ({ ...prev, form: clonedForm })),
      );
    },
    [state.form],
  );

  const onToggleExpandPanel = useCallback((name) => {
    setState(
      produce((draft) => {
        draft.form[name] = !draft.form[name];
      }),
    );
  }, []);

  useEffect(() => {
    setupBeforeUnloadListener();
    const transformIdentifierSources = (identifierSourcesFromServer) =>
      _.map(identifierSourcesFromServer, (source) => ({
        value: source.uuid,
        label: source.name,
      }));

    const fetchData = async () => {
      try {
        const identifierResponse = await http.get(`/web/identifierSource`);
        const identifierData = _.get(
          identifierResponse,
          "data._embedded.identifierSource",
          [],
        );
        setState((prev) => ({
          ...prev,
          identifierSources: transformIdentifierSources(identifierData),
        }));

        const operationalModules = await http
          .fetchJson("/web/operationalModules/")
          .then((res) => res.json);
        const groupSubjectTypes = _.filter(
          operationalModules.subjectTypes,
          (st) => !!st.group,
        );

        // Get form mappings to resolve program and encounter type for this form
        const formMappings = operationalModules.formMappings.filter(
          (fm) => fm.formUUID === formUUID && !fm.voided,
        );

        // Resolve program and encounter type names from mappings
        let currentProgram = null;
        let currentEncounterType = null;

        if (formMappings.length > 0) {
          const mapping = formMappings[0]; // Take first non-voided mapping

          if (mapping.programUUID) {
            const program = operationalModules.programs.find(
              (p) => p.uuid === mapping.programUUID,
            );
            currentProgram = program?.operationalProgramName || program?.name;
          }

          if (mapping.encounterTypeUUID) {
            const encounterType = operationalModules.encounterTypes.find(
              (et) => et.uuid === mapping.encounterTypeUUID,
            );
            currentEncounterType = encounterType?.name;
          }
        }

        setState((prev) => ({
          ...prev,
          groupSubjectTypes,
          subjectTypes: operationalModules.subjectTypes,
          programs: operationalModules.programs,
          encounterTypes: operationalModules.encounterTypes,
          currentProgram,
          currentEncounterType,
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          errorMsg: "Failed to load initial data",
        }));
      }
      await getForm();
    };

    fetchData();
  }, [getForm, formUUID]);

  const hasFormEditPrivilege = UserInfo.hasFormEditPrivilege(
    userInfo,
    state.formType,
  );
  const form = (
    <Grid container>
      <Grid
        container
        sx={{
          alignContent: "flex-end",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Grid size={{ sm: 10 }}>
          {state.nameError && (
            <FormHelperText error>Form name is empty</FormHelperText>
          )}
          <TextField
            type="string"
            id="name"
            label="Form name"
            placeholder="Enter form name"
            margin="normal"
            onChange={(event) => onUpdateFormName(event.target.value)}
            value={state.name}
            autoComplete="off"
            disabled={state.disableForm}
          />
        </Grid>
        {state.createFlag && (
          <Grid size={{ sm: 2 }}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={btnGroupClick}
              style={{ marginTop: "30px", marginBottom: "2px" }}
              disabled={state.disableForm}
            >
              Add Group
            </Button>
          </Grid>
        )}
        {hasFormEditPrivilege && !state.createFlag && (
          <Grid size={{ sm: 2 }}>
            <SaveComponent
              name="Save"
              onSubmit={validateForm}
              styles={{
                marginTop: "30px",
                marginBottom: "2px",
                marginLeft: "80px",
              }}
              disabledFlag={!state.detectBrowserCloseEvent || state.disableForm}
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
              borderRadius: "5px",
            }}
          >
            You do not have access to edit this form. Changes will not be saved
          </div>
        )}
      </Grid>
      <Grid size={{ sm: 12 }}>
        <Tabs
          style={{ background: "#2196f3", color: "white" }}
          value={state.activeTabIndex}
          onChange={onTabHandleChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#000000",
            },
          }}
        >
          <Tab
            label="Details"
            sx={{
              color: "#fff",
              "&.Mui-selected": {
                color: "#fff",
              },
            }}
          />
          <Tab
            label="Rules"
            sx={{
              color: "#fff",
              "&.Mui-selected": {
                color: "#fff",
              },
            }}
          />
        </Tabs>
        <TabContainer hidden={state.activeTabIndex !== 0}>
          <Grid container size={{ sm: 12 }}>
            <Grid size={{ sm: 12 }}>
              {state.errorMsg !== "" && (
                <FormControl fullWidth margin="dense">
                  <li style={{ color: "red" }}>{state.errorMsg}</li>
                </FormControl>
              )}
            </Grid>
          </Grid>
          {state.formType === "IndividualProfile" &&
            !_.isEmpty(getStaticFormElements(state.subjectType)) && (
              <div style={{ marginBottom: 30 }}>
                <StaticFormElementGroup
                  name={"First page questions (non editable)"}
                  formElements={getStaticFormElements(state.subjectType)}
                />
              </div>
            )}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="all-columns"
              direction="vertical"
              type="row"
            >
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {renderGroups()}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <SystemInfo {...state.form} direction={"row"} />
        </TabContainer>
        <div hidden={state.activeTabIndex !== 1}>
          <FormLevelRules
            form={state.form}
            onRuleUpdate={onRuleUpdate}
            onDeclarativeRuleUpdate={onDeclarativeRuleUpdate}
            onDecisionConceptsUpdate={onDecisionConceptsUpdate}
            onToggleExpandPanel={onToggleExpandPanel}
            onOpenAiRuleModal={() => setAiRuleModalOpen(true)}
            onAiRuleCreation={handleAiRuleCreation}
            entityName={getEntityNameForRules()}
            disabled={state.disableForm}
            encounterTypes={state.encounterTypes}
          />
        </div>
      </Grid>
    </Grid>
  );

  const redirectTo = record?.stateName;

  return (
    <FormDesignerContext.Provider value={{ setState, state }}>
      <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
        <Title title="Form Details" />
        {state.dataLoaded ? form : <div>Loading</div>}
        {state.redirectToWorkflow && redirectTo && (
          <Navigate to={`/appdesigner/${redirectTo}`} />
        )}
        {state.successAlert && (
          <CustomizedSnackbar
            message="Successfully updated the form"
            getDefaultSnackbarStatus={getDefaultSnackbarStatus}
            defaultSnackbarStatus={state.defaultSnackbarStatus}
          />
        )}

        {/* AI Rule Creation Modal */}
        <AiRuleCreationModal
          open={aiRuleModalOpen}
          onClose={() => {
            setAiRuleModalOpen(false);
            setAiRuleError(null);
            pendingSuccessCallbackRef.current = null;
            setScenariosContent(null);
            setConversationHistory([]);
          }}
          onSubmit={handleAiRuleCreation}
          scenariosContent={scenariosContent}
          conversationHistory={conversationHistory}
          title="Create Visit Schedule Rule with AI"
          placeholder="Describe: 1) What triggers the visit (encounter completion/enrolment), 2) Timing (e.g., 28 days after), 3) Next visit type. Example: 'After ANC encounter, schedule ANC Follow-up in 28 days'"
          loading={isValidationLoading}
          error={aiRuleError}
        />
      </Box>
    </FormDesignerContext.Provider>
  );
};

export default FormDetails;
