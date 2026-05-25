import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  FormControl,
  FormLabel,
  Alert,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import AsyncSelect from "react-select/async";
import { isEmpty, find, deburr } from "lodash";
import { JSEditor } from "../../common/components/JSEditor";
import { httpClient } from "../../common/utils/httpClient";
import { AvniSwitch } from "../../common/components/AvniSwitch";

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  minWidth: 600,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: "100%",
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
}));

const StyledWarningAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const emptyConfig = {
  sessionOutcomeReasonConcept: null,
  sessionOutcomeReasonConceptName: "",
  absenceReasonConcept: null,
  absenceReasonConceptName: "",
  followUpEncounterType: null,
  shareRule: "",
  autoShareOnSave: false,
};

const blankForm = {
  name: "",
  sortOrder: null,
  config: { ...emptyConfig },
};

const EditAttendanceTypeModal = ({
  open,
  onClose,
  onSave,
  attendanceType,
  existingTypes = [],
  subjectType,
}) => {
  const [formData, setFormData] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [encounterTypes, setEncounterTypes] = useState([]);

  const memberSubjectTypeUuid =
    subjectType?.groupRoles?.[0]?.memberSubjectTypeUUID;

  useEffect(() => {
    if (!open) return;
    if (attendanceType) {
      setFormData({
        ...attendanceType,
        config: { ...emptyConfig, ...(attendanceType.config || {}) },
      });
    } else {
      setFormData({
        ...blankForm,
        sortOrder: nextSortOrder(existingTypes),
        config: { ...emptyConfig },
      });
    }
    setErrors({});
  }, [open, attendanceType?.uuid]);

  useEffect(() => {
    if (!open || !memberSubjectTypeUuid) return;
    let cancelled = false;
    httpClient
      .fetchJson(`/web/encounterType/v2?subjectType=${memberSubjectTypeUuid}`)
      .then((response) => response.json)
      .then((types) => {
        if (!cancelled) setEncounterTypes(types || []);
      })
      .catch(() => {
        if (!cancelled) setEncounterTypes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, memberSubjectTypeUuid]);

  const sameConceptWarning =
    !!formData.config.sessionOutcomeReasonConcept &&
    formData.config.sessionOutcomeReasonConcept ===
      formData.config.absenceReasonConcept;

  const loadConcepts = async (inputValue) => {
    const searchValue = deburr(inputValue.trim()).toLowerCase();
    if (searchValue.length < 2) return [];
    try {
      const response = await httpClient.get(
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

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else {
      const duplicate = find(
        existingTypes,
        (type) =>
          type.uuid !== attendanceType?.uuid &&
          type.name.toLowerCase() === trimmedName.toLowerCase() &&
          !type.voided,
      );
      if (duplicate) {
        newErrors.name = "An attendance type with this name already exists";
      }
    }
    if (!formData.config.sessionOutcomeReasonConcept) {
      newErrors.sessionOutcomeReasonConcept =
        "Session Outcome Reason concept is required";
    }
    if (!formData.config.absenceReasonConcept) {
      newErrors.absenceReasonConcept = "Absence Reason concept is required";
    }
    setErrors(newErrors);
    return isEmpty(newErrors);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSave({
      ...formData,
      name: formData.name.trim(),
      sortOrder: formData.sortOrder ?? nextSortOrder(existingTypes),
    });
  };

  const handleClose = () => {
    setFormData(blankForm);
    setErrors({});
    onClose();
  };

  const updateConfig = (patch) =>
    setFormData((prev) => ({
      ...prev,
      config: { ...prev.config, ...patch },
    }));

  const handleShareRuleChange = (value) =>
    updateConfig({
      shareRule: value,
      autoShareOnSave: value ? formData.config.autoShareOnSave : false,
    });

  const renderConceptPicker = (fieldKey, label) => {
    const uuid = formData.config[fieldKey];
    const nameKey = `${fieldKey}Name`;
    const name = formData.config[nameKey];
    return (
      <StyledFormControl error={!!errors[fieldKey]}>
        <StyledFormLabel>{label} *</StyledFormLabel>
        <AsyncSelect
          cacheOptions
          loadOptions={loadConcepts}
          value={uuid ? { value: uuid, label: name || uuid } : null}
          onChange={(option) =>
            updateConfig({
              [fieldKey]: option?.value || null,
              [nameKey]: option?.label || "",
            })
          }
          placeholder="Search and select a coded concept"
          isClearable
        />
        {errors[fieldKey] && (
          <Typography variant="caption" color="error">
            {errors[fieldKey]}
          </Typography>
        )}
      </StyledFormControl>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {attendanceType ? "Edit Attendance Type" : "Add Attendance Type"}
      </DialogTitle>
      <StyledDialogContent>
        {errors.submit && (
          <StyledWarningAlert severity="error">
            {errors.submit}
          </StyledWarningAlert>
        )}

        {sameConceptWarning && (
          <StyledWarningAlert severity="warning">
            Both reason pickers will show the same answer set in this attendance
            type
          </StyledWarningAlert>
        )}

        <StyledFormControl error={!!errors.name}>
          <TextField
            label="Name *"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />
        </StyledFormControl>

        <StyledFormControl>
          <TextField
            label="Sort Order"
            type="number"
            value={formData.sortOrder ?? ""}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setFormData((prev) => ({
                ...prev,
                sortOrder: Number.isFinite(n) ? n : null,
              }));
            }}
            helperText="Leave blank to auto-assign"
            fullWidth
          />
        </StyledFormControl>

        {renderConceptPicker(
          "sessionOutcomeReasonConcept",
          "Session Outcome Reason Concept",
        )}
        {renderConceptPicker("absenceReasonConcept", "Absence Reason Concept")}

        <StyledFormControl>
          <InputLabel>Follow-up Encounter Type</InputLabel>
          <Select
            value={formData.config.followUpEncounterType || ""}
            onChange={(e) =>
              updateConfig({ followUpEncounterType: e.target.value || null })
            }
            fullWidth
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {encounterTypes.map((type) => (
              <MenuItem key={type.uuid} value={type.uuid}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>

        <StyledFormControl>
          <StyledFormLabel>Share Rule</StyledFormLabel>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
            JavaScript rule to determine sharing behavior (optional)
          </Typography>
          <JSEditor
            value={formData.config.shareRule || ""}
            onValueChange={handleShareRuleChange}
          />
        </StyledFormControl>

        <StyledFormControl>
          <AvniSwitch
            checked={!!formData.config.autoShareOnSave}
            onChange={(e) =>
              updateConfig({ autoShareOnSave: e.target.checked })
            }
            name="Auto-share on save"
            disabled={!formData.config.shareRule}
            toolTipKey="APP_DESIGNER_ATTENDANCE_AUTO_SHARE"
          />
        </StyledFormControl>
      </StyledDialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const nextSortOrder = (existingTypes) => {
  const orders = existingTypes
    .filter((t) => !t.voided)
    .map((t) => t.sortOrder || 0);
  return (orders.length ? Math.max(...orders) : 0) + 1;
};

export default EditAttendanceTypeModal;
