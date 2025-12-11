import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Navigate, useParams } from "react-router-dom";
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
import { filter, isEmpty, sortBy, toLower, trim } from "lodash";
import {
  findKeyValue,
  getKeyValue,
  safeKeyValues,
} from "../util/KeyValuesUtil";
import { SaveComponent } from "../../common/components/SaveComponent";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniTextField } from "../../common/components/AvniTextField";
import { ConceptActiveSwitch } from "../components/ConceptActiveSwitch";
import { SubjectConcept } from "../components/SubjectConcept";
import { PhoneNumberConcept } from "../components/PhoneNumberConcept";
import { EncounterConcept } from "../components/EncounterConcept";
import { ImageV2Concept } from "../components/ImageV2Concept";
import { AvniMediaUpload } from "../../common/components/AvniMediaUpload";
import ConceptService from "../../common/service/ConceptService";
import {
  ConceptAnswerError,
  WebConcept,
  WebConceptAnswerView,
  WebConceptView,
} from "../../common/model/WebConcept.ts";
import { Stack } from "@mui/material";
import { AvniSelect } from "../../common/components/AvniSelect";
import { ModelGeneral as General } from "avni-models";

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

export const alphabeticalSort = (conceptAnswers) => {
  return sortBy([...conceptAnswers], (ans) => toLower(ans.name));
};

export const validateCodedConceptAnswers = (answers) => {
  resetAnswerErrorState(answers);
  checkForEmptyAnswerNames(answers);
  checkForDuplicateAnswers(answers);
};

const resetAnswerErrorState = (answers) => {
  answers.forEach((answer) => {
    answer["isAnswerHavingError"] = { isErrored: false, type: "" };
  });
};

const checkForEmptyAnswerNames = (answers) => {
  answers
    .filter((answer) => !answer.voided && answer.name.trim() === "")
    .forEach((answer) => {
      answer["isAnswerHavingError"] = ConceptAnswerError.inError("required");
    });
};

const checkForDuplicateAnswers = (answers) => {
  const uniqueCodedAnswerNames = new Set();
  answers
    .filter((answer) => answer && !answer.voided)
    .forEach((answer) => {
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
    "encounterIdentifier",
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

  const getDefaultSnackbarStatus = useCallback((status) => {
    setDefaultSnackbarStatus(status);
  }, []);

  const handleRedirectShow = useCallback(() => {
    setRedirectShow(true);
  }, []);

  const onDeleteAnswer = useCallback((index) => {
    setConcept((prev) => {
      const answers = [...prev.answers];
      answers.splice(index, 1);
      return { ...prev, answers };
    });
  }, []);

  const onAddAnswer = useCallback(() => {
    setConcept((prev) => {
      const newAnswer = WebConceptAnswerView.emptyAnswer();
      newAnswer.uuid = General.randomUUID();
      return {
        ...prev,
        answers: [...prev.answers, newAnswer],
      };
    });
  }, []);

  const onChangeAnswerName = useCallback((answer, index) => {
    setConcept((prev) => {
      const answers = [...prev.answers];
      answers[index].name = answer;
      return { ...prev, answers };
    });
  }, []);

  const handleImageDelete = useCallback(() => {
    setConcept((prev) => ({
      ...prev,
      media: prev.media ? prev.media.filter((m) => m.type !== "Image") : [],
      unsavedImage: null,
    }));
  }, []);
  const handleVideoDelete = useCallback(() => {
    setConcept((prev) => ({
      ...prev,
      media: prev.media ? prev.media.filter((m) => m.type !== "Video") : [],
      unsavedVideo: null,
    }));
  }, []);

  const onMoveUp = useCallback((index) => {
    setConcept((prev) => ({
      ...prev,
      answers: moveUp(prev.answers, index),
    }));
  }, []);

  const onMoveDown = useCallback((index) => {
    setConcept((prev) => ({
      ...prev,
      answers: moveDown(prev.answers, index),
    }));
  }, []);

  const onAlphabeticalSort = useCallback(() => {
    setConcept((prev) => ({
      ...prev,
      answers: alphabeticalSort(prev.answers),
    }));
  }, []);

  const onSelectAnswerMedia = useCallback((mediaFile, index, type) => {
    setConcept((prev) => {
      const answers = [...prev.answers];
      answers[index].media = answers[index].media
        ? answers[index].media.filter((m) => m.type !== type)
        : [];
      type === "Video"
        ? (answers[index].unsavedVideo = mediaFile)
        : (answers[index].unsavedImage = mediaFile);
      return { ...prev, answers };
    });
  }, []);

  const onRemoveAnswerMedia = useCallback((index, type) => {
    setConcept((prev) => {
      const answers = [...prev.answers];
      answers[index].unsavedImage = null;
      answers[index].media = answers[index].media
        ? answers[index].media.filter((m) => m.type !== type)
        : [];
      return { ...prev, answers };
    });
  }, []);

  const onToggleAnswerField = useCallback((event, index) => {
    setConcept((prev) => {
      const answers = [...prev.answers];
      answers[index][event.target.id] = !answers[index][event.target.id];
      return { ...prev, answers };
    });
  }, []);

  const handleChange = useCallback(
    (stateHandler) => (e) => {
      const resetKeyValues =
        isCreatePage &&
        stateHandler === "dataType" &&
        e.target.value !== "Location";

      setConcept((prev) => {
        const c = { ...prev };

        // Use standard JavaScript string replace instead of the replace function
        const originalValue = e.target.value;
        c[stateHandler] = originalValue
          ? String(originalValue).replace(/\|/g, "")
          : "";

        if (resetKeyValues) c.keyValues = [];
        return c;
      });
    },
    [isCreatePage],
  );

  const validateKeyValues = useCallback(
    (error, key, errorKey) => {
      const keyValue = findKeyValue(concept.keyValues, key);
      if (keyValue === undefined || keyValue.value === "") {
        error[errorKey] = true;
      }
    },
    [concept.keyValues],
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
      if (answers.some((answer) => answer["isAnswerHavingError"].isErrored)) {
        error["isAnswerHavingError"] = true;
      }
    }

    if (concept.dataType === "Location") {
      const lowestLevel = getKeyValue(
        concept.keyValues,
        "lowestAddressLevelTypeUUIDs",
      );
      if (lowestLevel === undefined || lowestLevel.length === 0) {
        error.lowestAddressLevelRequired = true;
      }

      const highestLevelKeyValue = findKeyValue(
        concept.keyValues,
        "highestAddressLevelTypeUUID",
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
        "encounterIdentifierRequired",
      );
    }

    const emptyKeyValues = filter(
      safeKeyValues(concept.keyValues),
      (item) => item && (item.key === "" || item.value === ""),
    );
    if (emptyKeyValues.length > 0) {
      error["keyValueError"] = true;
    }

    setError(error);

    if (Object.keys(error).length === 0) await afterSuccessfulValidation();
  }, [concept, validateKeyValues]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      formValidation();
    },
    [formValidation],
  );

  const handleSaveError = useCallback((saveError) => {
    const newError = {
      nameConflict: saveError.includes("already exists"),
      mediaUploadFailed: !saveError.includes("already exists"),
      message: saveError,
    };
    setError(newError);
  }, []);

  const handleSaveSuccess = useCallback((savedConcept) => {
    setConceptCreationAlert(true);
    setDefaultSnackbarStatus(true);
    setRedirectShow(true);
    setRedirectOnDelete(false);
    setConcept(savedConcept);
  }, []);

  const processCodedConceptAnswers = useCallback(async (conceptToProcess) => {
    const answers = [...conceptToProcess.answers];

    // Process each answer to create missing concepts
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      if (answer.name && answer.name.trim() !== "") {
        try {
          // Check if concept exists
          const response = await http.get(
            `/web/concept?name=${encodeURIComponent(answer.name)}`,
          );
          if (response.status === 200) {
            // Concept exists, use its UUID
            answer.uuid = response.data.uuid;
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // Concept doesn't exist, create it with dataType "NA"
            const newConceptData = {
              name: answer.name,
              uuid: "", // Will be generated server-side
              dataType: "NA",
              createdBy: "",
              lastModifiedBy: "",
              creationDateTime: "",
              lastModifiedDateTime: "",
              keyValues: [],
            };

            try {
              const createResponse = await http.post("/concepts", [
                newConceptData,
              ]);
              if (createResponse.status === 200) {
                // Use the created concept's UUID
                answer.uuid = createResponse.data[0]?.uuid || "";
              }
            } catch (createError) {
              console.error("Error creating answer concept:", createError);
            }
          }
        }
      }
    }

    return { ...conceptToProcess, answers };
  }, []);

  const afterSuccessfulValidation = useCallback(async () => {
    let conceptToSave = concept;

    // Handle coded concept with potential non-existing answers
    if (concept.dataType === "Coded") {
      conceptToSave = await processCodedConceptAnswers(concept);
    }

    // Save the concept
    const { concept: savedConcept, error: saveError } =
      await ConceptService.saveConcept(conceptToSave);

    if (saveError) {
      handleSaveError(saveError);
      return;
    }

    handleSaveSuccess(savedConcept);
  }, [concept, processCodedConceptAnswers, handleSaveError, handleSaveSuccess]);

  const onNumericConceptAttributeAssignment = useCallback((event) => {
    setConcept((prev) => ({
      ...prev,
      [event.target.id]: event.target.value,
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
      setConcept((prev) => {
        const keyValues = [...safeKeyValues(prev.keyValues)];
        if (
          keyValue &&
          (keyValue.value === undefined ||
            keyValue.value === null ||
            keyValue.value === "")
        ) {
          const keyIndex = keyValues.findIndex((kv) => kv.key === keyValue.key);
          if (keyIndex >= 0) {
            keyValues.splice(keyIndex, 1);
          }
        } else {
          keyValues[index] =
            typeof keyValue.value === "object"
              ? handleObjectValue(keyValue)
              : castValueToBooleanOrInt(keyValue);
        }

        return { ...prev, keyValues };
      });
    },
    [handleObjectValue, castValueToBooleanOrInt],
  );

  const onAddNewKeyValue = useCallback(() => {
    setConcept((prev) => {
      const keyValues = [
        ...safeKeyValues(prev.keyValues),
        { key: "", value: "" },
      ];
      return { ...prev, keyValues };
    });
  }, []);

  const onDeleteKeyValue = useCallback((index) => {
    setConcept((prev) => {
      const keyValues = [...safeKeyValues(prev.keyValues)];
      keyValues.splice(index, 1);
      return { ...prev, keyValues };
    });
  }, []);

  const handleActive = useCallback((event) => {
    setConcept((prev) => ({
      ...prev,
      active: event.target.checked,
    }));
  }, []);

  const handleImageSelect = useCallback((mediaFile) => {
    setConcept((prev) => ({
      ...prev,
      media: prev.media ? prev.media.filter((m) => m.type !== "Image") : [],
      unsavedImage: mediaFile,
    }));
  }, []);
  const handleVideoSelect = useCallback((mediaFile) => {
    setConcept((prev) => ({
      ...prev,
      media: prev.media ? prev.media.filter((m) => m.type !== "Video") : [],
      unsavedVideo: mediaFile,
    }));
  }, []);

  const onDeleteConcept = useCallback(() => {
    if (window.confirm("Do you really want to delete the concept?")) {
      http.delete(`/concept/${concept.uuid}`).then((response) => {
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
        "verifyPhoneNumber",
      );
      if (!verificationKey) {
        const keyValues = [{ key: "verifyPhoneNumber", value: false }];
        setConcept((prev) => ({ ...prev, keyValues }));
      }
    }
  }, [concept.dataType, concept.keyValues]);

  useEffect(() => {
    if (concept.dataType === "ImageV2") {
      const locationInformationKey = findKeyValue(
        concept.keyValues,
        "captureLocationInformation",
      );
      if (!locationInformationKey) {
        const keyValues = [{ key: "captureLocationInformation", value: false }];
        setConcept((prev) => ({ ...prev, keyValues }));
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
          "verifyPhoneNumber",
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
          "captureLocationInformation",
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

  const currentImageUrl =
    !isEmpty(concept.media) &&
    !isEmpty(concept.media.filter((m) => m.type === "Image"))
      ? concept.media.filter((m) => m.type === "Image")[0].url
      : null;
  const currentVideoUrl =
    !isEmpty(concept.media) &&
    !isEmpty(concept.media.filter((m) => m.type === "Video"))
      ? concept.media.filter((m) => m.type === "Video")[0].url
      : null;

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
              <FormControl fullWidth>
                <AvniSelect
                  id="dataType"
                  label="DataType"
                  value={concept.dataType}
                  onChange={handleChange("dataType")}
                  style={{ width: "200px" }}
                  options={dataTypes.map((datatype) => ({
                    value: datatype,
                    label: datatype,
                  }))}
                  toolTipKey={"APP_DESIGNER_CONCEPT_DATA_TYPE"}
                />
                {error.dataTypeSelectionAlert && (
                  <FormHelperText error>*Required</FormHelperText>
                )}
              </FormControl>
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
          <Grid xs={12}>
            <AvniMediaUpload
              key="image-upload"
              uniqueName="concept-image-upload"
              height={20}
              width={20}
              accept="image/*"
              onSelect={handleImageSelect}
              label={`Image (max ${
                Math.round(
                  (WebConceptView.MaxImageFileSize / 1024 + Number.EPSILON) *
                    10,
                ) / 10
              } KB)`}
              maxFileSize={WebConceptView.MaxImageFileSize}
              oldImgUrl={currentImageUrl}
              localMediaUrl={
                concept.unsavedImage
                  ? URL.createObjectURL(concept.unsavedImage)
                  : null
              }
              onDelete={handleImageDelete}
            />
            <Box />
            <AvniMediaUpload
              key="video-upload"
              uniqueName="concept-video-upload"
              height={20}
              width={20}
              accept="video/*"
              onSelect={handleVideoSelect}
              mediaType={"Video"}
              label={`Video (max ${
                Math.round(
                  (WebConceptView.MaxVideoFileSize / 1024 / 1024 +
                    Number.EPSILON) *
                    10,
                ) / 10
              } MB)`}
              maxFileSize={WebConceptView.MaxVideoFileSize}
              oldImgUrl={currentVideoUrl}
              localMediaUrl={
                concept.unsavedVideo
                  ? URL.createObjectURL(concept.unsavedVideo)
                  : null
              }
              onDelete={handleVideoDelete}
            />
            {error && error.mediaUploadFailed && (
              <FormControl error sx={{ mt: 0.5 }}>
                <FormHelperText error>{error.message}</FormHelperText>
              </FormControl>
            )}
          </Grid>
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
            justifyContent="space-between"
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
