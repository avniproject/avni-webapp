import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  FormControl,
  Select,
  Grid,
  IconButton,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { httpClient as http } from "common/utils/httpClient";
import CustomizedSnackbar from "./CustomizedSnackbar";
import _ from "lodash";
import DeleteIcon from "@mui/icons-material/Delete";
import { default as UUID } from "uuid";
import {
  FormTypeEntities,
  encounterFormTypes,
  programFormTypes,
} from "../common/constants";
import { formMappingUniqueKey } from "../common/FormMappingKey";
import {
  encounterTypeLabel,
  encounterTypeOptions,
  programLabel,
  programOptions,
  withoutCombinationsAlreadyUsed,
} from "../common/FormMappingNarrowing";
import { describeDecisionMapping } from "../common/FormMappingDescription";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { SaveComponent } from "../../common/components/SaveComponent";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";
// This screen keeps the untouched response body so Copy to clipboard can offer it, so it wants the
// body-taking form rather than the one that reaches into an axios error.
import { messageFromServerErrorBody } from "../../common/utils/serverErrorMessage";

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
    errorMsg: "",
  });

  const addSubjectTypeErrorIfMissing = (errorsList, formMap, index) => {
    addErrorIfMissing(
      errorsList,
      formMap,
      "subjectTypeUuid",
      index,
      "subject type",
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
      "encounter type",
    );
  };

  const addErrorIfMissing = (
    errorsList,
    formMap,
    fieldKey,
    index,
    fieldName,
  ) => {
    if (formMap[fieldKey] === "") {
      errorsList.unselectedData[fieldKey + index] =
        `Please select ${fieldName}.`;
    }
  };

  const validateForm = () => {
    if (_.every(state.formMappings, (fm) => fm.voided)) {
      return true;
    }
    const errorsList = {
      existingMapping: {},
      unselectedData: {},
    };
    const formMappings = state.formMappings;
    const existingMappings = [];

    if (_.isNil(state.formTypeInfo))
      errorsList["formTypeInfo"] = "Please select form type.";

    if (state.formTypeInfo !== FormTypeEntities.ChecklistItem) {
      let count = 0;
      _.forEach(formMappings, (formMap) => {
        if (!formMap.voided) count += 1;
      });
      if (count === 0)
        errorsList["name"] = "Please add at least one form mapping.";
    }

    _.forEach(formMappings, (formMap, index) => {
      const formTypeInfo = state.formTypeInfo;
      if (!formMap.voided) {
        // The key lives in FormMappingKey so it can be tested; a form type with no branch there returns
        // undefined, which makes the second mapping of that type look like a duplicate of the first.
        const uniqueString = formMappingUniqueKey(formTypeInfo, formMap);

        if (formTypeInfo === FormTypeEntities.IndividualProfile) {
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForProgramEncounter(formTypeInfo)) {
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          addProgramErrorIfMissing(errorsList, formMap, index);
          addEncounterTypeErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForProgramEnrolment(formTypeInfo)) {
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          addProgramErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForSubjectEncounter(formTypeInfo)) {
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          addEncounterTypeErrorIfMissing(errorsList, formMap, index);
        }

        // Approval and Rejection attach to all four shapes, so only the subject type is required. The
        // programme and the visit type are legitimately absent on the subject-only shape, and demanding
        // them would make three of the four shapes unsaveable.
        if (FormTypeEntities.isApprovalDecisionForm(formTypeInfo)) {
          addSubjectTypeErrorIfMissing(errorsList, formMap, index);
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

    setState((prev) => ({ ...prev, errors: errorsList }));
    return Object.keys(errorsList).length === 0;
  };

  const getDefaultSnackbarStatus = (defaultSnackbarStatus) => {
    setState((prev) => ({ ...prev, defaultSnackbarStatus }));
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
          // The switch is hidden for Approval and Rejection, so anything still set on those mappings is
          // a leftover from before it was hidden, or from the type having been changed. Sending false
          // clears it rather than letting a meaningless true sit in form_mapping forever.
          const mappingsToSave = FormTypeEntities.isApprovalDecisionForm(
            state.formTypeInfo,
          )
            ? state.formMappings.map((formMap) => ({
                ...formMap,
                enableApproval: false,
              }))
            : state.formMappings;
          const response = await http.put(`/web/forms/${state.uuid}/metadata`, {
            name: state.name,
            formType: state.formTypeInfo.formType,
            formMappings: mappingsToSave,
          });
          const formMappings = mappingsToSave.map((formMap) => ({
            ...formMap,
            newFlag: false,
          }));
          setState((prev) => ({
            ...prev,
            showUpdateAlert: true,
            defaultSnackbarStatus: true,
            formMappings,
            errorMsg: "",
          }));
        } catch (error) {
          if (error.response.status === 404) {
            setState((prev) => ({
              ...prev,
              showUpdateAlert: true,
              defaultSnackbarStatus: true,
              errorMsg: "",
            }));
          } else {
            setState((prev) => ({
              ...prev,
              errorMsg: error.response.data,
              showUpdateAlert: false,
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
        setState((prev) => ({
          ...prev,
          name: formResponse.data.name,
          formTypeInfo: FormTypeEntities.getFormTypeInfo(
            formResponse.data.formType,
          ),
          uuid: formResponse.data.uuid,
        }));

        const modulesResponse = await http.get("/web/operationalModules");
        const data = { ...modulesResponse.data };
        const formMappings = data.formMappings
          .filter((formMapping) => formMapping.formUUID === id)
          .map((formMapping) => ({
            uuid: formMapping.uuid,
            programUuid: formMapping.programUUID,
            subjectTypeUuid: formMapping.subjectTypeUUID,
            encounterTypeUuid: formMapping.encounterTypeUUID,
            taskTypeUuid: formMapping.taskTypeUUID,
            enableApproval: formMapping.enableApproval,
            voided: false,
            newFlag: false,
            updatedFlag: false,
          }));
        // The organisation's whole mapping list stays on state.data. It is what says which programmes a
        // subject type enrols in and which visit types belong to each, so it is what narrows the dropdowns
        // below. state.formMappings remains this form's own rows.
        setState((prev) => ({
          ...prev,
          formMappings,
          data,
        }));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  const onChangeField = (event) => {
    if (
      event.target.name === "formType" &&
      event.target.value !== state.formTypeInfo
    ) {
      const formMappings = state.formMappings.map((formMap) => ({
        ...formMap,
        voided: true,
      }));
      setState((prev) => ({
        ...prev,
        formTypeInfo: event.target.value,
        formMappings,
        warningFlag: true,
        dirtyFlag: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
        dirtyFlag: true,
      }));
    }
  };

  const programNameElement = (index) => {
    const subjectTypeUuid = state.formMappings[index].subjectTypeUuid;
    // Narrowed to the subject type, then stripped of anything another row on this form already uses, so a
    // duplicate cannot be built rather than being refused on save.
    const programs = withoutCombinationsAlreadyUsed(
      programOptions(
        state.data.programs,
        state.data.formMappings,
        subjectTypeUuid,
        state.formTypeInfo,
      ),
      "programUuid",
      state.formMappings,
      index,
      state.formTypeInfo,
    );
    return (
      <FormControl fullWidth margin="dense">
        <AvniFormLabel
          label="Program Name"
          toolTipKey="APP_DESIGNER_FORM_MAPPING_PROGRAM_NAME"
        />
        <Select
          name="programUuid"
          value={state.formMappings[index].programUuid || ""}
          disabled={!subjectTypeUuid}
          // The saved value is drawn from the organisation's full list rather than from a matching
          // MenuItem, so a mapping already holding a programme the narrowed list no longer offers keeps
          // showing it and is sent back unchanged. Without this such a row renders as an empty box and a
          // save made for an unrelated reason rewrites it.
          renderValue={(uuid) => programLabel(state.data.programs, uuid)}
          onChange={(event) =>
            handleMappingChange(index, "programUuid", event.target.value)
          }
        >
          {programs.map((program) => (
            <MenuItem key={program.uuid} value={program.uuid}>
              {/* Same fallback programLabel uses. Without it a programme with no operational name renders
                  as a blank row here and then appears by name once selected. */}
              {program.operationalProgramName || program.name}
            </MenuItem>
          ))}
        </Select>
        {renderError("programUuid", index)}
      </FormControl>
    );
  };

  const handleMappingChange = (index, property, value) => {
    const formMappings = [...state.formMappings];
    if (formMappings[index][property] !== value) {
      if (!formMappings[index]["newFlag"]) {
        setState((prev) => ({ ...prev, warningFlag: true }));
      }
      formMappings[index][property] = value;
      // A programme belongs to one subject type and a visit type to one programme, so changing either
      // invalidates what sits below it and the row is cleared downward. Only a deliberate change does
      // this - opening the screen leaves every saved value alone, including the ones already outside the
      // narrowed lists. An absent field stays absent rather than becoming empty: form types that never
      // carry a programme hold null there, and that is not the same as unanswered.
      if (property === "subjectTypeUuid") {
        if (formMappings[index].programUuid)
          formMappings[index].programUuid = "";
        if (formMappings[index].encounterTypeUuid)
          formMappings[index].encounterTypeUuid = "";
      }
      if (property === "programUuid" && formMappings[index].encounterTypeUuid) {
        formMappings[index].encounterTypeUuid = "";
      }
      setState((prev) => ({ ...prev, formMappings, dirtyFlag: true }));
    }
  };

  const taskTypeElement = (index) => (
    <FormControl fullWidth margin="dense">
      <AvniFormLabel
        label="Task Name"
        toolTipKey="APP_DESIGNER_FORM_MAPPING_TASK_NAME"
      />
      <Select
        name="taskUuid"
        value={state.formMappings[index].taskTypeUuid || ""}
        onChange={(event) =>
          handleMappingChange(index, "taskTypeUuid", event.target.value)
        }
      >
        {state.data["taskTypes"]?.map((taskType) => (
          <MenuItem key={taskType.uuid} value={taskType.uuid}>
            {taskType.name}
          </MenuItem>
        ))}
      </Select>
      {renderError("taskTypeUuid", index)}
    </FormControl>
  );

  const subjectTypeElement = (index) => {
    // On a registration form the subject type is the whole key, so one already used on another row would
    // make this one a duplicate. On the other form types it is only part of the key and nothing is
    // dropped until the rest of the row matches too.
    const subjectTypes = withoutCombinationsAlreadyUsed(
      state.data.subjectTypes,
      "subjectTypeUuid",
      state.formMappings,
      index,
      state.formTypeInfo,
    );
    return (
      <FormControl fullWidth margin="dense">
        <AvniFormLabel
          label="Subject Type"
          toolTipKey="APP_DESIGNER_FORM_MAPPING_SUBJECT_TYPE"
        />
        <Select
          name="subjectTypeUuid"
          value={state.formMappings[index].subjectTypeUuid || ""}
          onChange={(event) =>
            handleMappingChange(index, "subjectTypeUuid", event.target.value)
          }
        >
          {subjectTypes.map((subjectType) => (
            <MenuItem key={subjectType.uuid} value={subjectType.uuid}>
              {subjectType.operationalSubjectTypeName}
            </MenuItem>
          ))}
        </Select>
        {renderError("subjectTypeUuid", index)}
      </FormControl>
    );
  };

  const formTypes = () =>
    FormTypeEntities.getAllFormTypeInfo().map((formTypeInfo) => (
      <MenuItem key={formTypeInfo} value={formTypeInfo}>
        {formTypeInfo.display}
      </MenuItem>
    ));

  const encounterTypesElement = (index) => {
    const { subjectTypeUuid, programUuid } = state.formMappings[index];
    // A programme on the row switches this from the subject's own visit types to that programme's. The two
    // are different sets, and offering both is what allowed a programme's visit type onto a mapping
    // outside that programme.
    const encounterTypes = withoutCombinationsAlreadyUsed(
      encounterTypeOptions(
        state.data.encounterTypes,
        state.data.formMappings,
        subjectTypeUuid,
        programUuid,
        state.formTypeInfo,
      ),
      "encounterTypeUuid",
      state.formMappings,
      index,
      state.formTypeInfo,
    );
    return (
      <FormControl fullWidth margin="dense">
        <AvniFormLabel
          label="Encounter Type"
          toolTipKey="APP_DESIGNER_FORM_MAPPING_ENCOUNTER_TYPE"
        />
        <Select
          name="encounterTypeUuid"
          value={state.formMappings[index].encounterTypeUuid || ""}
          disabled={!subjectTypeUuid}
          renderValue={(uuid) =>
            encounterTypeLabel(state.data.encounterTypes, uuid)
          }
          onChange={(event) =>
            handleMappingChange(index, "encounterTypeUuid", event.target.value)
          }
        >
          {encounterTypes.map((encounterType) => (
            <MenuItem key={encounterType.uuid} value={encounterType.uuid}>
              {encounterType.name}
            </MenuItem>
          ))}
        </Select>
        {renderError("encounterTypeUuid", index)}
      </FormControl>
    );
  };

  // Approval and Rejection attach to all four subject type / programme / visit type shapes, and a filled-in
  // row reads as covering all of them when it names one. The sentence says which, in the same words the
  // server uses when it rejects a mapping, so the screen and the error message agree.
  const renderDecisionTarget = (mapping) => {
    const target = describeDecisionMapping(
      state.formTypeInfo,
      mapping,
      state.data,
    );
    if (!target) return null;
    return <FormHelperText sx={{ mt: -1, mb: 1 }}>{target}</FormHelperText>;
  };

  const renderError = (propertyName, index) =>
    state.errors.unselectedData?.[propertyName + index] && (
      <FormHelperText error>
        {state.errors.unselectedData[propertyName + index]}
      </FormHelperText>
    );

  const removeMapping = (index) => {
    const formMappings = [...state.formMappings];
    if (formMappings[index].newFlag) {
      formMappings.splice(index, 1);
      setState((prev) => ({ ...prev, formMappings }));
    } else {
      formMappings[index]["voided"] = true;
      setState((prev) => ({
        ...prev,
        formMappings,
        dirtyFlag: true,
        warningFlag: true,
      }));
    }
  };

  const addMapping = (program, encounter) => {
    setState((prev) => ({
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
          newFlag: true,
        },
      ],
    }));
  };

  const encounterTypes = encounterFormTypes.includes(state.formTypeInfo);
  const programBased = programFormTypes.includes(state.formTypeInfo);
  const notChecklistItemBased =
    FormTypeEntities.ChecklistItem !== state.formTypeInfo;
  const isTaskFormType = FormTypeEntities.Task === state.formTypeInfo;
  // Enable Approval switches on the approval workflow for the record a form collects. An Approval or
  // Rejection form collects the approver's answers about a record that is already in that workflow, so
  // the switch has nothing to turn on there - avni-server only ever reads enable_approval from the
  // mapping of the form being judged. Offering it on these two types invited an administrator to set a
  // flag that does nothing, and to read its being off as "approval is not configured".
  const isApprovalDecisionFormType = FormTypeEntities.isApprovalDecisionForm(
    state.formTypeInfo,
  );

  return (
    <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
      <Title title={state.name} />
      <div>
        <form>
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
                        <Grid size={{ xs: 12, sm: 2 }}>
                          {subjectTypeElement(index)}
                        </Grid>
                      )}
                      {isTaskFormType && (
                        <Grid size={{ xs: 12, sm: 2 }}>
                          {taskTypeElement(index)}
                        </Grid>
                      )}
                      {programBased && (
                        <Grid size={{ xs: 12, sm: 3 }}>
                          {programNameElement(index)}
                        </Grid>
                      )}
                      {encounterTypes && (
                        <Grid size={{ xs: 12, sm: 3 }}>
                          {encounterTypesElement(index)}
                        </Grid>
                      )}
                      {!isTaskFormType && !isApprovalDecisionFormType && (
                        <Grid size={{ xs: 12, sm: 3 }} sx={{ mt: 5 }}>
                          <AvniSwitch
                            checked={state.formMappings[index].enableApproval}
                            onChange={(event) =>
                              handleMappingChange(
                                index,
                                "enableApproval",
                                event.target.checked,
                              )
                            }
                            name="Enable Approval"
                            toolTipKey="APP_DESIGNER_ENABLE_APPROVAL"
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 1 }}>
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
                    {renderDecisionTarget(mapping)}
                    {state.errors.existingMapping?.[index] && (
                      <FormControl fullWidth margin="dense">
                        <FormHelperText error>
                          {state.errors.existingMapping[index]}
                        </FormHelperText>
                      </FormControl>
                    )}
                  </div>
                ),
            )}
          {state.errorMsg && (
            <FormControl fullWidth margin="dense">
              <li style={{ color: "red" }}>
                {messageFromServerErrorBody(
                  state.errorMsg,
                  "Could not save the form.",
                )}
              </li>
              <CopyToClipboard text={state.errorMsg}>
                <button>Copy to clipboard</button>
              </CopyToClipboard>
            </FormControl>
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
            styles={{ marginTop: 10 }}
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
