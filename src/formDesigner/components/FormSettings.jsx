import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  FormControl,
  Select,
  Grid,
  IconButton,
  MenuItem,
  FormHelperText
} from "@mui/material";
import { httpClient as http } from "common/utils/httpClient";
import CustomizedSnackbar from "./CustomizedSnackbar";
import _ from "lodash";
import DeleteIcon from "@mui/icons-material/Delete";
import { default as UUID } from "uuid";
import {
  FormTypeEntities,
  encounterFormTypes,
  programFormTypes
} from "../common/constants";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { SaveComponent } from "../../common/components/SaveComponent";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import StringUtil from "../../common/utils/StringUtil";
import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";

const FormSettings = () => {
  const { id } = useParams();

  const [state, setState] = useState({
    uuid: "",
    name: "",
    formTypeInfo: null,
    formMappings: [],
    onClose: false,
    data: {},
    toFormDetails: "",
    errors: {},
    warningFlag: false,
    dirtyFlag: false,
    showUpdateAlert: false,
    defaultSnackbarStatus: true,
    errorMsg: ""
  });

  const addSubjectTypeErrorIfMissing = (errorsList, formMap, index) => {
    addErrorIfMissing(
      errorsList,
      formMap,
      "subjectTypeUuid",
      index,
      "subject type"
    );
  };

  const addProgramErrorIfMissing = (errorsList, formMap, index) => {
    addErrorIfMissing(errorsList, formMap, "programUuid", index, "program");
  };

  const addEncounterTypeErrorIfMissing = (errorsList, formMap, index) => {
    addErrorIfMissing(
      errorsList,
      formMap,
      "encounterTypeUuid",
      index,
      "encounter type"
    );
  };

  const addErrorIfMissing = (
    errorsList,
    formMap,
    fieldKey,
    index,
    fieldName
  ) => {
    if (formMap[fieldKey] === "") {
      errorsList.unselectedData[
        fieldKey + index
      ] = `Please select ${fieldName}.`;
    }
  };

  const validateForm = () => {
    if (_.every(state.formMappings, fm => fm.voided)) {
      return true;
    }
    const errorsList = {
      existingMapping: {},
      unselectedData: {}
    };
    const formMappings = state.formMappings;
    const existingMappings = [];

    if (_.isNil(state.formTypeInfo))
      errorsList["formTypeInfo"] = "Please select form type.";

    if (state.formTypeInfo !== FormTypeEntities.ChecklistItem) {
      let count = 0;
      _.forEach(formMappings, formMap => {
        if (!formMap.voided) count += 1;
      });
      if (count === 0)
        errorsList["name"] = "Please add at least one form mapping.";
    }

    _.forEach(formMappings, (formMap, index) => {
      let uniqueString;
      const formTypeInfo = state.formTypeInfo;
      if (!formMap.voided) {
        if (formTypeInfo === FormTypeEntities.IndividualProfile) {
          uniqueString = formMap.subjectTypeUuid;
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForProgramEncounter(formTypeInfo)) {
          uniqueString =
            formMap.subjectTypeUuid +
            formMap.programUuid +
            formMap.encounterTypeUuid;
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          addProgramErrorIfMissing(errorsList, formMap, index);
          addEncounterTypeErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForProgramEnrolment(formTypeInfo)) {
          uniqueString = formMap.subjectTypeUuid + formMap.programUuid;
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          addProgramErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForSubjectEncounter(formTypeInfo)) {
          uniqueString = formMap.subjectTypeUuid + formMap.encounterTypeUuid;
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          addEncounterTypeErrorIfMissing(errorsList, formMap, index);
        }
        if (existingMappings.includes(uniqueString)) {
          errorsList["existingMapping"][index] = "Same mapping already exists";
        }
        existingMappings.push(uniqueString);
      }
    });

    if (Object.keys(errorsList["unselectedData"]).length === 0) {
      delete errorsList.unselectedData;
    }
    if (Object.keys(errorsList["existingMapping"]).length === 0) {
      delete errorsList.existingMapping;
    }

    setState(prev => ({ ...prev, errors: errorsList }));
    return Object.keys(errorsList).length === 0;
  };

  const getDefaultSnackbarStatus = defaultSnackbarStatus => {
    setState(prev => ({ ...prev, defaultSnackbarStatus }));
  };

  const onFormSubmit = async () => {
    const validateFormStatus = validateForm();
    const voidedMessage = `Are you sure you want to change form details? It may result in your form not showing up in AVNI application so please do it only if you are aware of the consequences.`;
    if (validateFormStatus) {
      if (
        !state.warningFlag ||
        (state.warningFlag && window.confirm(voidedMessage))
      ) {
        try {
          const response = await http.put(`/web/forms/${state.uuid}/metadata`, {
            name: state.name,
            formType: state.formTypeInfo.formType,
            formMappings: state.formMappings
          });
          const formMappings = state.formMappings.map(formMap => ({
            ...formMap,
            newFlag: false
          }));
          setState(prev => ({
            ...prev,
            showUpdateAlert: true,
            defaultSnackbarStatus: true,
            formMappings,
            errorMsg: ""
          }));
        } catch (error) {
          if (error.response.status === 404) {
            setState(prev => ({
              ...prev,
              showUpdateAlert: true,
              defaultSnackbarStatus: true,
              errorMsg: ""
            }));
          } else {
            setState(prev => ({
              ...prev,
              errorMsg: error.response.data,
              showUpdateAlert: false
            }));
          }
        }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formResponse = await http.get(`/forms/export?formUUID=${id}`);
        setState(prev => ({
          ...prev,
          name: formResponse.data.name,
          formTypeInfo: FormTypeEntities.getFormTypeInfo(
            formResponse.data.formType
          ),
          uuid: formResponse.data.uuid
        }));

        const modulesResponse = await http.get("/web/operationalModules");
        const data = { ...modulesResponse.data };
        const formMappings = data.formMappings
          .filter(formMapping => formMapping.formUUID === id)
          .map(formMapping => ({
            uuid: formMapping.uuid,
            programUuid: formMapping.programUUID,
            subjectTypeUuid: formMapping.subjectTypeUUID,
            encounterTypeUuid: formMapping.encounterTypeUUID,
            taskTypeUuid: formMapping.taskTypeUUID,
            enableApproval: formMapping.enableApproval,
            voided: false,
            newFlag: false,
            updatedFlag: false
          }));
        delete data["formMappings"];
        setState(prev => ({
          ...prev,
          formMappings,
          data
        }));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  const onChangeField = event => {
    if (
      event.target.name === "formType" &&
      event.target.value !== state.formTypeInfo
    ) {
      const formMappings = state.formMappings.map(formMap => ({
        ...formMap,
        voided: true
      }));
      setState(prev => ({
        ...prev,
        formTypeInfo: event.target.value,
        formMappings,
        warningFlag: true,
        dirtyFlag: true
      }));
    } else {
      setState(prev => ({
        ...prev,
        [event.target.name]: event.target.value,
        dirtyFlag: true
      }));
    }
  };

  const programNameElement = index => (
    <FormControl fullWidth margin="dense">
      <AvniFormLabel
        label="Program Name"
        toolTipKey="APP_DESIGNER_FORM_MAPPING_PROGRAM_NAME"
      />
      <Select
        name="programUuid"
        value={state.formMappings[index].programUuid || ""}
        onChange={event =>
          handleMappingChange(index, "programUuid", event.target.value)
        }
      >
        {state.data.programs?.map(program => (
          <MenuItem key={program.uuid} value={program.uuid}>
            {program.operationalProgramName}
          </MenuItem>
        ))}
      </Select>
      {renderError("programUuid", index)}
    </FormControl>
  );

  const handleMappingChange = (index, property, value) => {
    const formMappings = [...state.formMappings];
    if (formMappings[index][property] !== value) {
      if (!formMappings[index]["newFlag"]) {
        setState(prev => ({ ...prev, warningFlag: true }));
      }
      formMappings[index][property] = value;
      setState(prev => ({ ...prev, formMappings, dirtyFlag: true }));
    }
  };

  const taskTypeElement = index => (
    <FormControl fullWidth margin="dense">
      <AvniFormLabel
        label="Task Name"
        toolTipKey="APP_DESIGNER_FORM_MAPPING_TASK_NAME"
      />
      <Select
        name="taskUuid"
        value={state.formMappings[index].taskTypeUuid || ""}
        onChange={event =>
          handleMappingChange(index, "taskTypeUuid", event.target.value)
        }
      >
        {state.data["taskTypes"]?.map(taskType => (
          <MenuItem key={taskType.uuid} value={taskType.uuid}>
            {taskType.name}
          </MenuItem>
        ))}
      </Select>
      {renderError("taskTypeUuid", index)}
    </FormControl>
  );

  const subjectTypeElement = index => (
    <FormControl fullWidth margin="dense">
      <AvniFormLabel
        label="Subject Type"
        toolTipKey="APP_DESIGNER_FORM_MAPPING_SUBJECT_TYPE"
      />
      <Select
        name="subjectTypeUuid"
        value={state.formMappings[index].subjectTypeUuid || ""}
        onChange={event =>
          handleMappingChange(index, "subjectTypeUuid", event.target.value)
        }
      >
        {state.data.subjectTypes?.map(subjectType => (
          <MenuItem key={subjectType.uuid} value={subjectType.uuid}>
            {subjectType.operationalSubjectTypeName}
          </MenuItem>
        ))}
      </Select>
      {renderError("subjectTypeUuid", index)}
    </FormControl>
  );

  const formTypes = () =>
    FormTypeEntities.getAllFormTypeInfo().map(formTypeInfo => (
      <MenuItem key={formTypeInfo} value={formTypeInfo}>
        {formTypeInfo.display}
      </MenuItem>
    ));

  const encounterTypesElement = index => (
    <FormControl fullWidth margin="dense">
      <AvniFormLabel
        label="Encounter Type"
        toolTipKey="APP_DESIGNER_FORM_MAPPING_ENCOUNTER_TYPE"
      />
      <Select
        name="encounterTypeUuid"
        value={state.formMappings[index].encounterTypeUuid || ""}
        onChange={event =>
          handleMappingChange(index, "encounterTypeUuid", event.target.value)
        }
      >
        {state.data.encounterTypes?.map(encounterType => (
          <MenuItem key={encounterType.uuid} value={encounterType.uuid}>
            {encounterType.name}
          </MenuItem>
        ))}
      </Select>
      {renderError("encounterTypeUuid", index)}
    </FormControl>
  );

  const renderError = (propertyName, index) =>
    state.errors.unselectedData?.[propertyName + index] && (
      <FormHelperText error>
        {state.errors.unselectedData[propertyName + index]}
      </FormHelperText>
    );

  const removeMapping = index => {
    const formMappings = [...state.formMappings];
    if (formMappings[index].newFlag) {
      formMappings.splice(index, 1);
      setState(prev => ({ ...prev, formMappings }));
    } else {
      formMappings[index]["voided"] = true;
      setState(prev => ({
        ...prev,
        formMappings,
        dirtyFlag: true,
        warningFlag: true
      }));
    }
  };

  const addMapping = (program, encounter) => {
    setState(prev => ({
      ...prev,
      dirtyFlag: true,
      formMappings: [
        ...prev.formMappings,
        {
          uuid: UUID(),
          id: "",
          formUuid: prev.uuid,
          subjectTypeUuid: "",
          programUuid: program ? "" : null,
          encounterTypeUuid: encounter ? "" : null,
          newFlag: true
        }
      ]
    }));
  };

  const encounterTypes = encounterFormTypes.includes(state.formTypeInfo);
  const programBased = programFormTypes.includes(state.formTypeInfo);
  const notChecklistItemBased =
    FormTypeEntities.ChecklistItem !== state.formTypeInfo;
  const isTaskFormType = FormTypeEntities.Task === state.formTypeInfo;

  return (
    <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
      <Title title={state.name} />
      <div>
        <form>
          {state.errorMsg && (
            <FormControl fullWidth margin="dense">
              <li style={{ color: "red" }}>
                {StringUtil.substring(state.errorMsg, 100)}
              </li>
              <CopyToClipboard text={state.errorMsg}>
                <button>Copy to clipboard</button>
              </CopyToClipboard>
            </FormControl>
          )}
          <AvniFormLabel
            label="Form name"
            style={{ fontSize: "12px" }}
            toolTipKey="APP_DESIGNER_FORM_MAPPING_FORM_NAME"
          />
          {state.name}
          <FormControl fullWidth margin="dense">
            <AvniFormLabel
              label="Form Type"
              toolTipKey="APP_DESIGNER_FORM_MAPPING_FORM_TYPE"
            />
            <Select
              id="formType"
              name="formType"
              value={state.formTypeInfo || ""}
              onChange={onChangeField}
              required
            >
              {formTypes()}
            </Select>
            {state.errors.formTypeInfo && (
              <FormHelperText error>{state.errors.formTypeInfo}</FormHelperText>
            )}
          </FormControl>
          {notChecklistItemBased &&
            state.formMappings.map(
              (mapping, index) =>
                !mapping.voided && (
                  <div key={index}>
                    <Grid container spacing={2} sx={{ width: "100%" }}>
                      {!isTaskFormType && (
                        <Grid item size={{ xs: 12, sm: 2 }}>
                          {subjectTypeElement(index)}
                        </Grid>
                      )}
                      {isTaskFormType && (
                        <Grid item size={{ xs: 12, sm: 2 }}>
                          {taskTypeElement(index)}
                        </Grid>
                      )}
                      {programBased && (
                        <Grid item size={{ xs: 12, sm: 3 }}>
                          {programNameElement(index)}
                        </Grid>
                      )}
                      {encounterTypes && (
                        <Grid item size={{ xs: 12, sm: 3 }}>
                          {encounterTypesElement(index)}
                        </Grid>
                      )}
                      {!isTaskFormType && (
                        <Grid item size={{ xs: 12, sm: 3 }} sx={{ mt: 5 }}>
                          <AvniSwitch
                            checked={state.formMappings[index].enableApproval}
                            onChange={event =>
                              handleMappingChange(
                                index,
                                "enableApproval",
                                event.target.checked
                              )
                            }
                            name="Enable Approval"
                            toolTipKey="APP_DESIGNER_ENABLE_APPROVAL"
                          />
                        </Grid>
                      )}
                      <Grid item size={{ xs: 12, sm: 1 }}>
                        <IconButton
                          aria-label="delete"
                          onClick={() => removeMapping(index)}
                          sx={{ mt: 1 }}
                          size="large"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Grid>
                    </Grid>
                    {state.errors.existingMapping?.[index] && (
                      <FormControl fullWidth margin="dense">
                        <FormHelperText error>
                          {state.errors.existingMapping[index]}
                        </FormHelperText>
                      </FormControl>
                    )}
                  </div>
                )
            )}
        </form>
        {notChecklistItemBased && (
          <Button
            color="primary"
            onClick={() => addMapping(programBased, encounterTypes)}
            sx={{ mt: 1 }}
          >
            Add mapping
          </Button>
        )}
        <div>
          <SaveComponent
            name="Save"
            onSubmit={onFormSubmit}
            styleClass={{ marginTop: 10 }}
            disabledFlag={!state.dirtyFlag}
          />
        </div>
        {state.showUpdateAlert && (
          <CustomizedSnackbar
            message="Form settings updated successfully!"
            getDefaultSnackbarStatus={getDefaultSnackbarStatus}
            defaultSnackbarStatus={state.defaultSnackbarStatus}
          />
        )}
      </div>
    </Box>
  );
};

export default FormSettings;
