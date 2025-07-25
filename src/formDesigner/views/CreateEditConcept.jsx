import React, { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import { httpClient as http } from "common/utils/httpClient";
import NumericConcept from "../components/NumericConcept";
import CodedConcept from "../components/CodedConcept";
import { LocationConcept } from "../components/LocationConcept";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import Box from "@mui/material/Box";
import { Title, usePermissions, useRecordContext } from "react-admin";
import KeyValues from "../components/KeyValues";
import { filter, find, replace, sortBy, toLower, trim } from "lodash";
import { SaveComponent } from "../../common/components/SaveComponent";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniTextField } from "../../common/components/AvniTextField";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import { useNavigate, useParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { ConceptActiveSwitch } from "../components/ConceptActiveSwitch";
import { SubjectConcept } from "../components/SubjectConcept";
import { PhoneNumberConcept } from "../components/PhoneNumberConcept";
import { EncounterConcept } from "../components/EncounterConcept";
import { ImageV2Concept } from "../components/ImageV2Concept";
import { AvniImageUpload } from "../../common/components/AvniImageUpload";
import ConceptService from "../../common/service/ConceptService";
import {
  ConceptAnswerError,
  WebConcept,
  WebConceptAnswerView,
  WebConceptView
} from "../../common/model/WebConcept";
import { useSelector, useDispatch } from "react-redux";
import { useForm, useFormContext } from "react-hook-form";

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
      if (
        uniqueCodedAnswerNames.size ===
        uniqueCodedAnswerNames.add(answer.name).size
      ) {
        answer.isAnswerHavingError = ConceptAnswerError.inError("duplicate");
      }
    });
};

const CreateEditConcept = ({ isCreatePage = false }) => {
  const { register, handleSubmit, setValue, getValues } = useForm({
    defaultValues: {
      concept: WebConceptView.emptyConcept(),
      active: false
    }
  });
  const {
    setError,
    clearErrors,
    formState: { errors }
  } = useFormContext();
  const [dataTypes, setDataTypes] = useState([]);
  const [conceptCreationAlert, setConceptCreationAlert] = useState(false);
  const [defaultSnackbarStatus, setDefaultSnackbarStatus] = useState(true);
  const [redirectShow, setRedirectShow] = useState(false);
  const [redirectOnDeleteOrCreate, setRedirectOnDeleteOrCreate] = useState(
    false
  );
  const [operationalModules, setOperationalModules] = useState(null);

  const readOnlyKeys = [
    "isWithinCatchment",
    "lowestAddressLevelTypeUUIDs",
    "highestAddressLevelTypeUUID",
    "subjectTypeUUID",
    "verifyPhoneNumber",
    "captureLocationInformation",
    "encounterTypeUUID",
    "encounterScope",
    "encounterIdentifier"
  ];

  useEffect(() => {
    const loadData = async () => {
      if (isCreatePage) {
        const response = await http.get("/concept/dataTypes");
        setDataTypes(sortBy(response.data));
      } else {
        const concept = await ConceptService.getConcept(uuid);
        setValue("concept", concept);
        setValue("active", concept.active);
      }
      const opModules = await http.get("/web/operationalModules");
      setOperationalModules(opModules.data);
    };
    loadData();
  }, [isCreatePage, uuid, setValue]);

  const handleChange = key => e => {
    const resetKeyValues =
      isCreatePage && key === "dataType" && e.target.value !== "Location";
    const concept = getValues("concept");
    const updatedConcept = {
      ...concept,
      [key]: replace(e.target.value, "|", "")
    };
    if (resetKeyValues) updatedConcept.keyValues = [];
    setValue("concept", updatedConcept);
    clearErrors();
  };

  const validateKeyValues = (error, key, errorKey) => {
    const concept = getValues("concept");
    const keyValue = concept.keyValues.find(kv => kv.key === key);
    if (!keyValue || keyValue.value === "") {
      setError(errorKey, { type: "manual", message: "*Required" });
    }
  };

  const onSubmit = async data => {
    const concept = data.concept;
    let formErrors = {};

    if (!concept.dataType) {
      setError("dataTypeSelectionAlert", {
        type: "manual",
        message: "*Required"
      });
      formErrors.dataTypeSelectionAlert = true;
    }
    if (!concept.name.trim()) {
      setError("isEmptyName", { type: "manual", message: "*Required" });
      formErrors.isEmptyName = true;
    }

    const numericRangeErrors = WebConcept.validateNumericRanges(concept);
    Object.entries(numericRangeErrors).forEach(([key, value]) => {
      if (value) setError(key, { type: "manual", message: "*Invalid" });
    });
    formErrors = { ...formErrors, ...numericRangeErrors };

    if (concept.dataType === "Coded") {
      validateCodedConceptAnswers(concept.answers);
      if (
        concept.answers.some(answer => answer.isAnswerHavingError.isErrored)
      ) {
        setError("isAnswerHavingError", {
          type: "manual",
          message: "*Invalid answers"
        });
        formErrors.isAnswerHavingError = true;
      }
    }

    if (concept.dataType === "Location") {
      validateKeyValues(
        formErrors,
        "lowestAddressLevelTypeUUIDs",
        "lowestAddressLevelRequired"
      );
      const highestLevelKeyValue = concept.keyValues.find(
        kv => kv.key === "highestAddressLevelTypeUUID"
      );
      if (highestLevelKeyValue?.value === "") {
        setError("highestAddressLevelRequired", {
          type: "manual",
          message: "*Required"
        });
        formErrors.highestAddressLevelRequired = true;
      }
    }

    if (concept.dataType === "Subject") {
      validateKeyValues(formErrors, "subjectTypeUUID", "subjectTypeRequired");
    }

    if (concept.dataType === "Encounter") {
      validateKeyValues(
        formErrors,
        "encounterTypeUUID",
        "encounterTypeRequired"
      );
      validateKeyValues(formErrors, "encounterScope", "encounterScopeRequired");
      validateKeyValues(
        formErrors,
        "encounterIdentifier",
        "encounterIdentifierRequired"
      );
    }

    const emptyKeyValues = filter(
      concept.keyValues,
      ({ key, value }) => key === "" || value === ""
    );
    if (emptyKeyValues.length > 0) {
      setError("keyValueError", {
        type: "manual",
        message: "*Invalid key-value"
      });
      formErrors.keyValueError = true;
    }

    if (Object.keys(formErrors).length === 0) {
      const { concept: savedConcept, error } = await ConceptService.saveConcept(
        concept
      );
      if (error) {
        setError("mediaUploadFailed", { type: "manual", message: error });
        return;
      }
      setConceptCreationAlert(true);
      setDefaultSnackbarStatus(true);
      if (isCreatePage) {
        setValue("concept", WebConceptView.emptyConcept());
        setRedirectOnDeleteOrCreate(true);
      } else {
        setValue("concept", savedConcept);
        setRedirectShow(true);
      }
    }
  };

  const onDeleteAnswer = index => {
    const concept = getValues("concept");
    const answers = [...concept.answers];
    answers.splice(index, 1);
    setValue("concept.answers", answers);
  };

  const onAddAnswer = () => {
    const concept = getValues("concept");
    setValue("concept.answers", [
      ...concept.answers,
      WebConceptAnswerView.emptyAnswer()
    ]);
  };

  const onChangeAnswerName = (answer, index) => {
    const concept = getValues("concept");
    const answers = [...concept.answers];
    answers[index].name = answer;
    setValue("concept.answers", answers);
  };

  const handleMediaDelete = () => {
    const concept = getValues("concept");
    setValue("concept.mediaUrl", null);
    setValue("concept.unSavedMediaFile", null);
  };

  const onMoveUp = index => {
    const concept = getValues("concept");
    setValue("concept.answers", moveUp(concept.answers, index));
  };

  const onMoveDown = index => {
    const concept = getValues("concept");
    setValue("concept.answers", moveDown(concept.answers, index));
  };

  const onAlphabeticalSort = () => {
    const concept = getValues("concept");
    setValue("concept.answers", alphabeticalSort(concept.answers));
  };

  const onSelectAnswerMedia = (mediaFile, index) => {
    const concept = getValues("concept");
    const answers = [...concept.answers];
    answers[index].unSavedMediaFile = mediaFile;
    setValue("concept.answers", answers);
  };

  const onRemoveAnswerMedia = index => {
    const concept = getValues("concept");
    const answers = [...concept.answers];
    answers[index].unSavedMediaFile = null;
    answers[index].mediaUrl = null;
    setValue("concept.answers", answers);
  };

  const onToggleAnswerField = (event, index) => {
    const concept = getValues("concept");
    const answers = [...concept.answers];
    answers[index][event.target.id] = !answers[index][event.target.id];
    setValue("concept.answers", answers);
  };

  const onNumericConceptAttributeAssignment = event => {
    setValue(event.target.id, event.target.value);
  };

  const castValueToBooleanOrInt = ({ key, value }) => {
    let castedValue = JSON.parse(trim(value));
    return { key: trim(key), value: castedValue };
  };

  const handleObjectValue = ({ key, value }) => {
    return { key: trim(key), value };
  };

  const onKeyValueChange = (keyValue, index) => {
    const concept = getValues("concept");
    const keyValues = [...concept.keyValues];
    keyValues[index] =
      typeof keyValue.value === "object"
        ? handleObjectValue(keyValue)
        : castValueToBooleanOrInt(keyValue);
    setValue("concept.keyValues", keyValues);
  };

  const onAddNewKeyValue = () => {
    const concept = getValues("concept");
    const keyValues = concept.keyValues || [];
    setValue("concept.keyValues", [...keyValues, { key: "", value: "" }]);
  };

  const onDeleteKeyValue = index => {
    const concept = getValues("concept");
    const keyValues = [...concept.keyValues];
    keyValues.splice(index, 1);
    setValue("concept.keyValues", keyValues);
  };

  const handleActive = event => {
    setValue("active", event.target.checked);
  };

  const handleMediaSelect = mediaFile => {
    setValue("concept.unSavedMediaFile", mediaFile);
  };

  const onDeleteConcept = async () => {
    if (window.confirm("Do you really want to delete the concept?")) {
      const response = await http.delete(
        `/concept/${getValues("concept.uuid")}`
      );
      if (response.status === 200) {
        setRedirectShow(false);
        setRedirectOnDeleteOrCreate(true);
      }
    }
  };

  const concept = getValues("concept");
  const classes = {
    textField: { width: 400, marginRight: 10 },
    select: { width: 400, height: 40, marginTop: 24 },
    button: { marginTop: 40 },
    inputLabel: { marginTop: 15, fontSize: 16 }
  };

  const conceptCreationMessage = isCreatePage
    ? "Concept created successfully."
    : "Concept updated successfully.";
  const appBarTitle = isCreatePage ? "Create Concept" : "Edit Concept";

  let dataTypeComponent;
  if (concept.dataType === "Numeric") {
    dataTypeComponent = (
      <NumericConcept
        onNumericConceptAttributeAssignment={
          onNumericConceptAttributeAssignment
        }
        numericDataTypeAttributes={concept}
      />
    );
  }
  if (concept.dataType === "Coded") {
    dataTypeComponent = (
      <CodedConcept
        answers={concept.answers}
        onDeleteAnswer={onDeleteAnswer}
        onAddAnswer={onAddAnswer}
        onChangeAnswerName={onChangeAnswerName}
        onToggleAnswerField={onToggleAnswerField}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onAlphabeticalSort={onAlphabeticalSort}
        onSelectAnswerMedia={onSelectAnswerMedia}
        onRemoveAnswerMedia={onRemoveAnswerMedia}
      />
    );
  }
  if (concept.dataType === "Location") {
    dataTypeComponent = (
      <LocationConcept
        updateConceptKeyValues={onKeyValueChange}
        keyValues={concept.keyValues}
        error={errors}
        isCreatePage={isCreatePage}
        inlineConcept={false}
      />
    );
  }
  if (concept.dataType === "Subject") {
    dataTypeComponent = (
      <SubjectConcept
        updateKeyValues={onKeyValueChange}
        keyValues={concept.keyValues}
        error={errors}
        isCreatePage={isCreatePage}
        inlineConcept={false}
        operationalModules={operationalModules}
      />
    );
  }
  if (concept.dataType === "Encounter") {
    dataTypeComponent = (
      <EncounterConcept
        updateKeyValues={onKeyValueChange}
        keyValues={concept.keyValues}
        error={errors}
        isCreatePage={isCreatePage}
        inlineConcept={false}
        operationalModules={operationalModules}
      />
    );
  }
  if (concept.dataType === "PhoneNumber") {
    const verificationKey = find(
      concept.keyValues,
      ({ key }) => key === "verifyPhoneNumber"
    );
    if (verificationKey) {
      dataTypeComponent = (
        <PhoneNumberConcept
          onKeyValueChange={onKeyValueChange}
          checked={verificationKey.value}
        />
      );
    } else {
      setValue("concept.keyValues", [
        { key: "verifyPhoneNumber", value: false }
      ]);
    }
  }
  if (concept.dataType === "ImageV2") {
    const locationInformationKey = find(
      concept.keyValues,
      ({ key }) => key === "captureLocationInformation"
    );
    if (locationInformationKey) {
      dataTypeComponent = (
        <ImageV2Concept
          onKeyValueChange={onKeyValueChange}
          checked={locationInformationKey.value}
        />
      );
    } else {
      setValue("concept.keyValues", [
        { key: "captureLocationInformation", value: false }
      ]);
    }
  }

  return (
    <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
      <DocumentationContainer filename={"Concept.md"}>
        <Title title={appBarTitle} />
        {!isCreatePage && (
          <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
            <Button
              color="primary"
              type="button"
              onClick={() => setRedirectShow(true)}
            >
              <VisibilityIcon /> Show
            </Button>
          </Grid>
        )}
        <Grid container direction="column" spacing={2}>
          <Grid size={12}>
            <AvniTextField
              id="name"
              label="Concept name"
              {...register("concept.name")}
              onChange={handleChange("name")}
              style={classes.textField}
              margin="normal"
              autoComplete="off"
              toolTipKey={"APP_DESIGNER_CONCEPT_NAME"}
              fullWidth
            />
            {errors.isEmptyName && (
              <FormHelperText error>*Required.</FormHelperText>
            )}
            {errors.nameError && (
              <FormHelperText error>
                Same name concept already exist.
              </FormHelperText>
            )}
          </Grid>
          <Grid size={12}>
            {isCreatePage ? (
              <ToolTipContainer toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}>
                <FormControl fullWidth>
                  <InputLabel style={classes.inputLabel}>Datatype *</InputLabel>
                  <Select
                    id="dataType"
                    label="DataType"
                    {...register("concept.dataType")}
                    onChange={handleChange("dataType")}
                    style={classes.select}
                  >
                    {dataTypes.map(datatype => (
                      <MenuItem value={datatype} key={datatype}>
                        {datatype}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.dataTypeSelectionAlert && (
                    <FormHelperText error>*Required</FormHelperText>
                  )}
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
          {!isCreatePage && (
            <Grid size={12}>
              <ConceptActiveSwitch
                active={getValues("active")}
                handleActive={handleActive}
                conceptUUID={concept.uuid}
              />
            </Grid>
          )}
          {["Coded", "NA"].includes(concept.dataType) && (
            <Grid size={12}>
              <AvniImageUpload
                height={20}
                width={20}
                onSelect={handleMediaSelect}
                label={`Image (max ${Math.round(
                  (WebConceptView.MaxFileSize / 1024 + Number.EPSILON) * 10
                ) / 10} KB)`}
                maxFileSize={WebConceptView.MaxFileSize}
                oldImgUrl={concept.mediaUrl}
                onDelete={handleMediaDelete}
              />
              {errors.mediaUploadFailed && (
                <FormControl error style={{ marginTop: 4 }}>
                  <FormHelperText error>
                    {errors.mediaUploadFailed.message}
                  </FormHelperText>
                </FormControl>
              )}
            </Grid>
          )}
          <Grid size={12}>{dataTypeComponent}</Grid>
          <Grid size={12}>
            <KeyValues
              keyValues={concept.keyValues}
              onKeyValueChange={onKeyValueChange}
              onAddNewKeyValue={onAddNewKeyValue}
              onDeleteKeyValue={onDeleteKeyValue}
              error={errors.keyValueError}
              readOnlyKeys={readOnlyKeys}
            />
          </Grid>
          <Grid
            container
            spacing={2}
            sx={{ justifyContent: "flex-end", alignItems: "center" }}
            size={12}
          >
            <Grid>
              <SaveComponent
                name="save"
                onSubmit={handleSubmit(onSubmit)}
                styleClass={{ marginLeft: "12px", marginTop: "10px" }}
              />
            </Grid>
            <Grid>
              {!isCreatePage && (
                <Button
                  style={{ color: "red", marginTop: "10px" }}
                  onClick={onDeleteConcept}
                >
                  <DeleteIcon /> Delete
                </Button>
              )}
            </Grid>
          </Grid>
          <Grid size={12}>
            {conceptCreationAlert && (
              <CustomizedSnackbar
                message={conceptCreationMessage}
                getDefaultSnackbarStatus={setDefaultSnackbarStatus}
                defaultSnackbarStatus={defaultSnackbarStatus}
              />
            )}
          </Grid>
        </Grid>
      </DocumentationContainer>
      {redirectShow && (
        <Navigate to={`/appDesigner/concept/${concept.uuid}/show`} />
      )}
      {redirectOnDeleteOrCreate && <Navigate to={`/appDesigner/concepts`} />}
    </Box>
  );
};

export default CreateEditConcept;
