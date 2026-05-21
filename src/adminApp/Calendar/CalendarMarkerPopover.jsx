import { useEffect, useState } from "react";
import {
  Popover,
  Box,
  Typography,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  Alert,
} from "@mui/material";
import { Calendar } from "openchs-models";
import { extractServerErrorMessage } from "./utils/errorMessage";

const CalendarMarkerPopover = ({
  open,
  anchorEl,
  dateIso,
  dayType,
  marker,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(marker);
  const [name, setName] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (marker) {
      setName(marker.name || "");
      setIsWorking(Boolean(marker.isWorking));
    } else {
      setName("");
      // Default the radio to whichever direction flips the cell:
      //  - working_day  -> default Off    (isWorking = false)
      //  - weekly_off   -> default Working (isWorking = true)
      setIsWorking(dayType === Calendar.dayType.WEEKLY_OFF);
    }
  }, [open, marker, dayType]);

  const handleSave = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    Promise.resolve(onSave({ name: name.trim(), isWorking, dateIso, marker }))
      .then(() => {
        setSaving(false);
        onClose();
      })
      .catch((err) => {
        setSaving(false);
        setError(extractServerErrorMessage(err, "Failed to save marker."));
      });
  };

  const handleDelete = () => {
    if (!marker) return;
    if (!window.confirm(`Remove marker "${marker.name}"?`)) return;
    setSaving(true);
    setError(null);
    Promise.resolve(onDelete(marker))
      .then(() => {
        setSaving(false);
        onClose();
      })
      .catch((err) => {
        setSaving(false);
        setError(extractServerErrorMessage(err, "Failed to delete marker."));
      });
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={saving ? undefined : onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Box sx={{ p: 2, width: 260 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {isEditing ? "Edit marker" : "Add marker"} for {dateIso}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          size="small"
          label="Marker name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <RadioGroup
          row
          value={isWorking ? "working" : "off"}
          onChange={(e) => setIsWorking(e.target.value === "working")}
          sx={{ mb: 1 }}
        >
          <FormControlLabel
            value="off"
            control={<Radio size="small" />}
            label="Off"
          />
          <FormControlLabel
            value="working"
            control={<Radio size="small" />}
            label="Working"
          />
        </RadioGroup>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          {isEditing ? (
            <Button
              color="error"
              size="small"
              onClick={handleDelete}
              disabled={saving}
            >
              Remove
            </Button>
          ) : (
            <span />
          )}
          <Box>
            <Button size="small" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {isEditing ? "Save" : "Add"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Popover>
  );
};

export default CalendarMarkerPopover;
