import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { Alert, FormControl, FormLabel, Typography } from "@mui/material";
import AsyncSelect from "react-select/async";
import { deburr } from "lodash";
import { httpClient as http } from "../../common/utils/httpClient";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: "100%",
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const HelperText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
}));

const SETTING_KEY = "removalReasonConceptUuid";

const loadConcepts = async (inputValue) => {
  const searchValue = deburr(inputValue.trim()).toLowerCase();
  if (searchValue.length < 2) return [];
  try {
    const response = await http.get(
      `/search/concept?name=${encodeURIComponent(searchValue)}`,
    );
    return response.data
      .filter((concept) => concept.dataType === "Coded")
      .map((concept) => ({ value: concept.uuid, label: concept.name }));
  } catch (error) {
    console.error("Error loading concepts:", error);
    return [];
  }
};

export const RemovalReasonConceptPicker = ({ subjectType, dispatch }) => {
  const currentUuid = subjectType?.settings?.[SETTING_KEY] || null;
  const [conceptName, setConceptName] = useState("");
  const [answerCount, setAnswerCount] = useState(null);

  useEffect(() => {
    if (!currentUuid) {
      setConceptName("");
      setAnswerCount(null);
      return;
    }
    let cancelled = false;
    http
      .get(`/web/concept/${currentUuid}`)
      .then((response) => {
        if (cancelled) return;
        const concept = response.data || {};
        setConceptName(concept.name || "");
        const answers = (concept.conceptAnswers || []).filter(
          (ca) => !ca.voided && ca.answerConcept && !ca.answerConcept.voided,
        );
        setAnswerCount(answers.length);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load removal reason concept:", error);
        setConceptName("");
        setAnswerCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUuid]);

  const onChange = (option) => {
    dispatch({
      type: "settings",
      payload: { setting: SETTING_KEY, value: option?.value || null },
    });
  };

  return (
    <StyledFormControl component="fieldset">
      <StyledFormLabel>Removal reason concept</StyledFormLabel>
      <AsyncSelect
        cacheOptions
        loadOptions={loadConcepts}
        value={
          currentUuid
            ? { value: currentUuid, label: conceptName || currentUuid }
            : null
        }
        onChange={onChange}
        placeholder="Search and select a coded concept"
        isClearable
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 1400 }) }}
      />
      <HelperText variant="caption">
        Optional. When set, mobile users must choose a removal reason when
        removing a member.
      </HelperText>
      {currentUuid && answerCount === 0 && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Selected concept has no answers configured. Removal reason dropdown
          will be empty in the mobile app.
        </Alert>
      )}
    </StyledFormControl>
  );
};

export default RemovalReasonConceptPicker;
