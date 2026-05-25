import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  FormLabel,
  Alert,
} from "@mui/material";
import { format } from "date-fns";
import { extractServerErrorMessage } from "./utils/errorMessage";

// Server's BadRequestError message for the partial-unique conflict is shaped
// like "A marker already exists for <calendar> on <date>." — we match on that
// to switch the dialog into "conflict mode" where the user can jump to the
// existing marker instead of staring at a generic error.
const DUPLICATE_MARKER_PHRASE = "marker already exists";

const AddMarkerDialog = ({ open, onClose, onSave, onEditExisting }) => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [name, setName] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState(null);
  const [conflictDate, setConflictDate] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(format(new Date(), "yyyy-MM-dd"));
      setName("");
      setIsWorking(false);
      setError(null);
      setConflictDate(null);
    }
  }, [open]);

  const handleSave = () => {
    if (!date) {
      setError("Date is required");
      return;
    }
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    setConflictDate(null);
    const attemptedDate = date;
    Promise.resolve(
      onSave({ name: name.trim(), isWorking, dateIso: attemptedDate }),
    )
      .then(() => {
        setSaving(false);
        onClose();
      })
      .catch((err) => {
        setSaving(false);
        const message = extractServerErrorMessage(
          err,
          "Failed to save marker.",
        );
        setError(message);
        if (message.toLowerCase().includes(DUPLICATE_MARKER_PHRASE)) {
          setConflictDate(attemptedDate);
        }
      });
  };

  const handleEditExisting = () => {
    if (!conflictDate || !onEditExisting) return;
    onEditExisting(conflictDate);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Add marker</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          type="date"
          label="Date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            // User is composing a new attempt — drop the previous conflict
            // so the "Edit existing marker" affordance doesn't keep pointing
            // at the old date.
            if (conflictDate) {
              setConflictDate(null);
              setError(null);
            }
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Marker type</FormLabel>
          <RadioGroup
            row
            value={isWorking ? "working" : "off"}
            onChange={(e) => setIsWorking(e.target.value === "working")}
          >
            <FormControlLabel value="off" control={<Radio />} label="Off" />
            <FormControlLabel
              value="working"
              control={<Radio />}
              label="Working"
            />
          </RadioGroup>
        </FormControl>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        {conflictDate && onEditExisting && (
          <Button
            onClick={handleEditExisting}
            disabled={saving}
            color="primary"
          >
            Edit existing marker
          </Button>
        )}
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMarkerDialog;
