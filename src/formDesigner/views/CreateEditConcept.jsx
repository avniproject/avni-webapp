import { useState, useEffect, useCallback } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useParams, Navigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { Title } from "react-admin";
import { httpClient as http } from "common/utils/httpClient";
import NumericConcept from "../components/NumericConcept";
import CodedConcept from "../components/CodedConcept";
import { LocationConcept } from "../components/LocationConcept";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import KeyValues from "../components/KeyValues";
import { filter, replace, sortBy, toLower, trim } from "lodash";
import {
  findKeyValue,
  getKeyValue,
  safeKeyValues
} from "../util/KeyValuesUtil";
import { SaveComponent } from "../../common/components/SaveComponent";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniTextField } from "../../common/components/AvniTextField";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";
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
} from "../../common/model/WebConcept.ts";
import { Stack } from "@mui/material";

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
  const params = useParams();

  const emptyConcept = WebConceptView.emptyConcept();
  emptyConcept.keyValues = emptyConcept.keyValues || [];

  const [concept, setConcept] = useState(emptyConcept);
  const [conceptCreationAlert, setConceptCreationAlert] = useState(false);
  const [error, setError] = useState({});
  const [dataTypes, setDataTypes] = useState([]);
  const [defaultSnackbarStatus, setDefaultSnackbarStatus] = useState(true);
  const [redirectShow, setRedirectShow] = useState(false);
  const [redirectOnDelete, setRedirectOnDelete] = useState(false);
  const [operationalModules, setOperationalModules] = useState([]);

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

  const onLoad = useCallback(async () => {
    if (isCreatePage) {
      const response = await http.get("/concept/dataTypes");
      setDataTypes(sortBy(response.data));
    } else {
      const conceptData = await ConceptService.getConcept(params.uuid);
      setConcept(conceptData);
    }

    const opModules = await http.get("/web/operationalModules");
    setOperationalModules(opModules.data);
  }, [isCreatePage, params.uuid]);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const getDefaultSnackbarStatus = useCallback(status => {
    setDefaultSnackbarStatus(status);
  }, []);

  const handleRedirectShow = useCallback(() => {
    setRedirectShow(true);
  }, []);

  const onDeleteAnswer = useCallback(index => {
    setConcept(prev => {
      const answers = [...prev.answers];
      answers.splice(index, 1);
      return { ...prev, answers };
    });
  }, []);

  const onAddAnswer = useCallback(() => {
    setConcept(prev => ({
      ...prev,
      answers: [...prev.answers, WebConceptAnswerView.emptyAnswer()]
    }));
  }, []);

  const onChangeAnswerName = useCallback((answer, index) => {
    setConcept(prev => {
      const answers = [...prev.answers];
      answers[index].name = answer;
      return { ...prev, answers };
    });
  }, []);

  const handleMediaDelete = useCallback(() => {
    setConcept(prev => ({ ...prev, mediaUrl: null, unSavedMediaFile: null }));
  }, []);

  const onMoveUp = useCallback(index => {
    setConcept(prev => ({
      ...prev,
      answers: moveUp(prev.answers, index)
    }));
  }, []);

  const onMoveDown = useCallback(index => {
    setConcept(prev => ({
      ...prev,
      answers: moveDown(prev.answers, index)
    }));
  }, []);

  const onAlphabeticalSort = useCallback(() => {
    setConcept(prev => ({
      ...prev,
      answers: alphabeticalSort(prev.answers)
    }));
  }, []);

  const onSelectAnswerMedia = useCallback((mediaFile, index) => {
    setConcept(prev => {
      const answers = [...prev.answers];
      answers[index].unSavedMediaFile = mediaFile;
      return { ...prev, answers };
    });
  }, []);

  const onRemoveAnswerMedia = useCallback(index => {
    setConcept(prev => {
      const answers = [...prev.answers];
      answers[index].unSavedMediaFile = null;
      answers[index].mediaUrl = null;
      return { ...prev, answers };
    });
  }, []);

  const onToggleAnswerField = useCallback((event, index) => {
    setConcept(prev => {
      const answers = [...prev.answers];
      answers[index][event.target.id] = !answers[index][event.target.id];
      return { ...prev, answers };
    });
  }, []);

  const handleChange = useCallback(
    stateHandler => e => {
      const resetKeyValues =
        isCreatePage &&
        stateHandler === "dataType" &&
        e.target.value !== "Location";
      setConcept(prev => {
        const c = { ...prev };
        c[stateHandler] = replace(e.target.value, "|", "");
        if (resetKeyValues) c.keyValues = [];
        return c;
      });
    },
    [isCreatePage]
  );

  const validateKeyValues = useCallback(
    (error, key, errorKey) => {
      const keyValue = findKeyValue(concept.keyValues, key);
      if (keyValue === undefined || keyValue.value === "") {
        error[errorKey] = true;
      }
    },
    [concept.keyValues]
  );

  const formValidation = useCallback(async () => {
    let error = {};
    const answers = concept.answers;

    if (concept.dataType === "") {
      error["dataTypeSelectionAlert"] = true;
    }
    if (concept.name.trim() === "") {
      error["isEmptyName"] = true;
    }

    const numericRangeErrors = WebConcept.validateNumericRanges(concept);
    error = { ...error, ...numericRangeErrors };

    if (concept.dataType === "Coded") {
      validateCodedConceptAnswers(answers);
      if (answers.some(answer => answer["isAnswerHavingError"].isErrored)) {
        error["isAnswerHavingError"] = true;
      }
    }

    if (concept.dataType === "Location") {
      const lowestLevel = getKeyValue(
        concept.keyValues,
        "lowestAddressLevelTypeUUIDs"
      );
      if (lowestLevel === undefined || lowestLevel.length === 0) {
        error.lowestAddressLevelRequired = true;
      }

      const highestLevelKeyValue = findKeyValue(
        concept.keyValues,
        "highestAddressLevelTypeUUID"
      );
      if (
        highestLevelKeyValue !== undefined &&
        highestLevelKeyValue.value === ""
      ) {
        error["highestAddressLevelRequired"] = true;
      }
    }

    if (concept.dataType === "Subject") {
      validateKeyValues(error, "subjectTypeUUID", "subjectTypeRequired");
    }

    if (concept.dataType === "Encounter") {
      validateKeyValues(error, "encounterTypeUUID", "encounterTypeRequired");
      validateKeyValues(error, "encounterScope", "encounterScopeRequired");
      validateKeyValues(
        error,
        "encounterIdentifier",
        "encounterIdentifierRequired"
      );
    }

    const emptyKeyValues = filter(
      safeKeyValues(concept.keyValues),
      item => item && (item.key === "" || item.value === "")
    );
    if (emptyKeyValues.length > 0) {
      error["keyValueError"] = true;
    }

    setError(error);

    if (Object.keys(error).length === 0) await afterSuccessfulValidation();
  }, [concept, validateKeyValues]);

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();
      formValidation();
    },
    [formValidation]
  );

  const afterSuccessfulValidation = useCallback(async () => {
    const {
      concept: savedConcept,
      error: saveError
    } = await ConceptService.saveConcept(concept);
    if (saveError) {
      const newError = {
        nameConflict: saveError.includes("already exists"),
        mediaUploadFailed: !saveError.includes("already exists"),
        message: saveError
      };
      setError(newError);
      return;
    }

    setConceptCreationAlert(true);
    setDefaultSnackbarStatus(true);
    setRedirectShow(true);
    setRedirectOnDelete(false);
    setConcept(savedConcept);
  }, [concept]);

  const onNumericConceptAttributeAssignment = useCallback(event => {
    setConcept(prev => ({
      ...prev,
      [event.target.id]: event.target.value
    }));
  }, []);

  const castValueToBooleanOrInt = useCallback(({ key, value }) => {
    let castedValue;
    try {
      castedValue = JSON.parse(trim(value));
    } catch (e) {
      castedValue = trim(value);
    }
    return { key: trim(key), value: castedValue };
  }, []);

  const handleObjectValue = useCallback(({ key, value }) => {
    return { key: trim(key), value: value };
  }, []);

  const onKeyValueChange = useCallback(
    (keyValue, index) => {
      setConcept(prev => {
        const keyValues = [...safeKeyValues(prev.keyValues)];
        keyValues[index] =
          typeof keyValue.value === "object"
            ? handleObjectValue(keyValue)
            : castValueToBooleanOrInt(keyValue);
        return { ...prev, keyValues };
      });
    },
    [handleObjectValue, castValueToBooleanOrInt]
  );

  const onAddNewKeyValue = useCallback(() => {
    setConcept(prev => {
      const keyValues = [
        ...safeKeyValues(prev.keyValues),
        { key: "", value: "" }
      ];
      return { ...prev, keyValues };
    });
  }, []);

  const onDeleteKeyValue = useCallback(index => {
    setConcept(prev => {
      const keyValues = [...safeKeyValues(prev.keyValues)];
      keyValues.splice(index, 1);
      return { ...prev, keyValues };
    });
  }, []);

  const handleActive = useCallback(event => {
    setConcept(prev => ({
      ...prev,
      active: event.target.checked
    }));
  }, []);

  const handleMediaSelect = useCallback(mediaFile => {
    setConcept(prev => ({ ...prev, unSavedMediaFile: mediaFile }));
  }, []);

  const onDeleteConcept = useCallback(() => {
    if (window.confirm("Do you really want to delete the concept?")) {
      http.delete(`/concept/${concept.uuid}`).then(response => {
        if (response.status === 200) {
          setRedirectShow(false);
          setRedirectOnDelete(true);
        }
      });
    }
  }, [concept.uuid]);

  useEffect(() => {
    if (concept.dataType === "PhoneNumber") {
      const verificationKey = findKeyValue(
        concept.keyValues,
        "verifyPhoneNumber"
      );
      if (!verificationKey) {
        const keyValues = [{ key: "verifyPhoneNumber", value: false }];
        setConcept(prev => ({ ...prev, keyValues }));
      }
    }
  }, [concept.dataType, concept.keyValues]);

  useEffect(() => {
    if (concept.dataType === "ImageV2") {
      const locationInformationKey = findKeyValue(
        concept.keyValues,
        "captureLocationInformation"
      );
      if (!locationInformationKey) {
        const keyValues = [{ key: "captureLocationInformation", value: false }];
        setConcept(prev => ({ ...prev, keyValues }));
      }
    }
  }, [concept.dataType, concept.keyValues]);

  const renderDataTypeComponent = () => {
    switch (concept.dataType) {
      case "Numeric":
        return (
          <NumericConcept
            onNumericConceptAttributeAssignment={
              onNumericConceptAttributeAssignment
            }
            numericDataTypeAttributes={{ ...concept, error }}
          />
        );
      case "Coded":
        return (
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
      case "Location":
        return (
          <LocationConcept
            updateConceptKeyValues={onKeyValueChange}
            keyValues={concept.keyValues || []}
            error={error}
            isCreatePage={isCreatePage}
            inlineConcept={false}
          />
        );
      case "Subject":
        return (
          <SubjectConcept
            updateKeyValues={onKeyValueChange}
            keyValues={concept.keyValues || []}
            error={error}
            isCreatePage={isCreatePage}
            inlineConcept={false}
            operationalModules={operationalModules}
          />
        );
      case "Encounter":
        return (
          <EncounterConcept
            updateKeyValues={onKeyValueChange}
            keyValues={concept.keyValues || []}
            error={error}
            isCreatePage={isCreatePage}
            inlineConcept={false}
            operationalModules={operationalModules}
          />
        );
      case "PhoneNumber": {
        const verificationKey = findKeyValue(
          concept.keyValues,
          "verifyPhoneNumber"
        );
        return verificationKey ? (
          <PhoneNumberConcept
            onKeyValueChange={onKeyValueChange}
            checked={verificationKey.value}
          />
        ) : null;
      }
      case "ImageV2": {
        const locationInformationKey = findKeyValue(
          concept.keyValues,
          "captureLocationInformation"
        );
        return locationInformationKey ? (
          <ImageV2Concept
            onKeyValueChange={onKeyValueChange}
            checked={locationInformationKey.value}
          />
        ) : null;
      }
      default:
        return null;
    }
  };

  const conceptCreationMessage = isCreatePage
    ? "Concept created successfully."
    : "Concept updated successfully.";
  const appBarTitle = isCreatePage ? "Create Concept" : "Edit Concept";

  return (
    <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
      <DocumentationContainer filename={"Concept.md"}>
        <Title title={appBarTitle} />
        {!isCreatePage && (
          <Grid container justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button color="primary" type="button" onClick={handleRedirectShow}>
              <VisibilityIcon /> Show
            </Button>
          </Grid>
        )}
        <Stack>
          <Grid xs={12}>
            <AvniTextField
              id="name"
              label="Concept name"
              value={concept.name}
              onChange={handleChange("name")}
              sx={{ width: 400, mr: 1.25 }}
              margin="normal"
              autoComplete="off"
              toolTipKey={"APP_DESIGNER_CONCEPT_NAME"}
              fullWidth
            />
            {error.isEmptyName && (
              <FormHelperText error>*Required.</FormHelperText>
            )}
            {!error.isEmptyName && error.nameConflict && (
              <FormHelperText error>{error.message}</FormHelperText>
            )}
          </Grid>
          <Grid xs={12}>
            {isCreatePage ? (
              <ToolTipContainer toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}>
                <FormControl fullWidth>
                  <InputLabel sx={{ mt: 1.875, fontSize: 16 }}>
                    Datatype *
                  </InputLabel>
                  <Select
                    id="dataType"
                    label="DataType"
                    value={concept.dataType}
                    onChange={handleChange("dataType")}
                    sx={{
                      width: 400,
                      height: 40,
                      mt: 3,
                      "& .MuiSelect-select": {
                        backgroundColor: "white"
                      }
                    }}
                  >
                    {dataTypes.map(datatype => (
                      <MenuItem value={datatype} key={datatype}>
                        {datatype}
                      </MenuItem>
                    ))}
                  </Select>
                  {error.dataTypeSelectionAlert && (
                    <FormHelperText error>*Required</FormHelperText>
                  )}
                </FormControl>
              </ToolTipContainer>
            ) : (
              <AvniTextField
                id="dataType"
                label="DataType"
                value={concept.dataType}
                sx={{ width: 400, height: 40, mt: 3 }}
                disabled={true}
                toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}
                fullWidth
              />
            )}
          </Grid>
          {!isCreatePage && (
            <Grid xs={12}>
              <ConceptActiveSwitch
                active={concept.active}
                handleActive={handleActive}
                conceptUUID={concept.uuid}
              />
            </Grid>
          )}
          {["Coded", "NA"].includes(concept.dataType) && (
            <Grid xs={12}>
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
              {error && error.mediaUploadFailed && (
                <FormControl error sx={{ mt: 0.5 }}>
                  <FormHelperText error>{error.message}</FormHelperText>
                </FormControl>
              )}
            </Grid>
          )}
          <Grid>{renderDataTypeComponent()}</Grid>
          <Grid xs={12}>
            <KeyValues
              keyValues={concept.keyValues || []}
              onKeyValueChange={onKeyValueChange}
              onAddNewKeyValue={onAddNewKeyValue}
              onDeleteKeyValue={onDeleteKeyValue}
              error={error.keyValueError}
              readOnlyKeys={readOnlyKeys}
            />
          </Grid>
          <Grid
            item
            xs={12}
            container
            justifyContent="flex-end"
            alignItems="center"
            spacing={2}
          >
            <Grid>
              <SaveComponent
                name="save"
                onSubmit={handleSubmit}
                styles={{ marginLeft: "12px", marginTop: "10px" }}
              />
            </Grid>
            <Grid>
              {!isCreatePage && (
                <Button
                  sx={{ color: "red", mt: 1.25 }}
                  onClick={onDeleteConcept}
                >
                  <DeleteIcon /> Delete
                </Button>
              )}
            </Grid>
          </Grid>
          <Grid xs={12}>
            {conceptCreationAlert && (
              <CustomizedSnackbar
                message={conceptCreationMessage}
                getDefaultSnackbarStatus={getDefaultSnackbarStatus}
                defaultSnackbarStatus={defaultSnackbarStatus}
              />
            )}
          </Grid>
        </Stack>
      </DocumentationContainer>
      {redirectShow && (
        <Navigate to={`/appDesigner/concept/${concept.uuid}/show`} replace />
      )}
      {redirectOnDelete && <Navigate to={`/appDesigner/concepts`} replace />}
    </Box>
  );
};

export default CreateEditConcept;
