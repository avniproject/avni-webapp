import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  FormLabel,
  Tooltip,
  Box,
  Alert,
} from "@mui/material";
import { Calendar } from "openchs-models";
import WorkingPatternEditor, {
  patternToOccurrenceMap,
  occurrenceMapToPattern,
} from "./WorkingPatternEditor";
import AddressLevelSinglePicker from "./AddressLevelSinglePicker";
import { extractServerErrorMessage } from "./utils/errorMessage";

const SCOPE_GLOBAL = "GLOBAL";
const SCOPE_PER_LOCATION = "PER_LOCATION";

function parsePattern(jsonStringOrObject) {
  if (!jsonStringOrObject) return Calendar.defaultWorkingPattern;
  if (typeof jsonStringOrObject === "string") {
    try {
      return JSON.parse(jsonStringOrObject);
    } catch (_e) {
      return Calendar.defaultWorkingPattern;
    }
  }
  return jsonStringOrObject;
}

// Mode lock — derived from all non-voided calendars (including the one being
// edited). Per the spec, if the org has any calendars, the radio is locked to
// the current mode; switching modes requires deleting all calendars first.
function deriveLockedMode(existingCalendars) {
  const active = (existingCalendars || []).filter((c) => !c.voided);
  if (active.length === 0) return null;
  return active.some((c) => !c.addressLevelUUID)
    ? SCOPE_GLOBAL
    : SCOPE_PER_LOCATION;
}

const CalendarFormDialog = ({
  open,
  onClose,
  onSaved,
  calendar,
  existingCalendars,
}) => {
  const isEdit = Boolean(calendar?.uuid);
  const [name, setName] = useState("");
  const [scope, setScope] = useState(SCOPE_GLOBAL);
  const [addressLevelUUID, setAddressLevelUUID] = useState(null);
  const [patternMap, setPatternMap] = useState(
    patternToOccurrenceMap(Calendar.defaultWorkingPattern),
  );
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);

  const lockedMode = deriveLockedMode(existingCalendars);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setServerError(null);
    if (calendar) {
      setName(calendar.name || "");
      const initialScope = calendar.addressLevelUUID
        ? SCOPE_PER_LOCATION
        : SCOPE_GLOBAL;
      setScope(initialScope);
      setAddressLevelUUID(calendar.addressLevelUUID || null);
      setPatternMap(
        patternToOccurrenceMap(parsePattern(calendar.workingPattern)),
      );
    } else {
      setName("");
      setScope(lockedMode || SCOPE_GLOBAL);
      setAddressLevelUUID(null);
      setPatternMap(patternToOccurrenceMap(Calendar.defaultWorkingPattern));
    }
  }, [open, calendar, lockedMode]);

  const handleSubmit = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required";
    if (scope === SCOPE_PER_LOCATION && !addressLevelUUID)
      nextErrors.addressLevel = "Location is required for per-location scope";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      uuid: calendar?.uuid,
      name: name.trim(),
      workingPattern: occurrenceMapToPattern(patternMap),
      addressLevelUUID: scope === SCOPE_PER_LOCATION ? addressLevelUUID : null,
      voided: false,
    };

    setSaving(true);
    setServerError(null);
    Promise.resolve(onSaved(payload))
      .then(() => {
        setSaving(false);
        onClose();
      })
      .catch((err) => {
        setSaving(false);
        setServerError(
          extractServerErrorMessage(err, "Failed to save calendar."),
        );
      });
  };

  const isModeLocked = Boolean(lockedMode);

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{isEdit ? "Edit calendar" : "Add calendar"}</DialogTitle>
      <DialogContent dividers>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          required
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          sx={{ mb: 2 }}
        />
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Scope</FormLabel>
          <RadioGroup
            row
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            {[
              {
                value: SCOPE_GLOBAL,
                label: "Global",
                lockMessage:
                  "Per-location calendars already exist. Delete all of them to switch back to a global calendar.",
              },
              {
                value: SCOPE_PER_LOCATION,
                label: "Per-location",
                lockMessage:
                  "A global calendar already exists. Delete it to switch to per-location calendars.",
              },
            ].map((opt) => {
              const locked = isModeLocked && lockedMode !== opt.value;
              return (
                <Tooltip
                  key={opt.value}
                  title={locked ? opt.lockMessage : ""}
                  disableHoverListener={!locked}
                >
                  <FormControlLabel
                    value={opt.value}
                    control={<Radio disabled={locked} />}
                    label={opt.label}
                  />
                </Tooltip>
              );
            })}
          </RadioGroup>
        </FormControl>
        {scope === SCOPE_PER_LOCATION && (
          <Box sx={{ mb: 2 }}>
            <AddressLevelSinglePicker
              label="Location"
              value={addressLevelUUID}
              onChange={(uuid) => setAddressLevelUUID(uuid || null)}
            />
            {errors.addressLevel && (
              <FormLabel error sx={{ mt: 0.5, fontSize: 12 }}>
                {errors.addressLevel}
              </FormLabel>
            )}
          </Box>
        )}
        <WorkingPatternEditor value={patternMap} onChange={setPatternMap} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarFormDialog;
