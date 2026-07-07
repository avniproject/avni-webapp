import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const RosterRow = ({
  row,
  index,
  reasonAnswers,
  otherReasonConceptUUID,
  followUpEncounterTypeUuid,
  onTogglePresence,
  onSetReason,
  onSetOtherReason,
  onToggleNeedsFollowUp,
  readOnly,
}) => {
  const isAbsent = row.status === "Absent";
  const selectedReasons = row.reasonConceptUUIDs || [];
  const showNeedsFollowUp = isAbsent && !!followUpEncounterTypeUuid;
  // Show the free-text box when the configured "Other" answer is the selected reason.
  const showOtherReason =
    !!otherReasonConceptUUID &&
    selectedReasons.includes(otherReasonConceptUUID);

  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        borderBottom: "1px solid #EEE",
        backgroundColor: "white",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1">{row.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            #{index + 1}
          </Typography>
        </Box>
        <Chip
          label={isAbsent ? "Absent" : "Present"}
          size="small"
          color={isAbsent ? "default" : "success"}
          variant={isAbsent ? "outlined" : "filled"}
        />
        <Switch
          checked={!isAbsent}
          onChange={() => onTogglePresence(row.subjectUUID)}
          disabled={readOnly}
          color="success"
        />
      </Box>
      {isAbsent && (
        <Box sx={{ mt: 1, ml: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {"Reasons for absence"}
          </Typography>
          <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
            <Select
              multiple
              value={selectedReasons}
              displayEmpty
              onChange={(e) => onSetReason(row.subjectUUID, e.target.value)}
              disabled={readOnly}
              renderValue={(selected) =>
                selected.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {"Select reasons (optional)"}
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((uuid) => {
                      const answer = (reasonAnswers || []).find(
                        (a) => a.uuid === uuid,
                      );
                      return (
                        <Chip
                          key={uuid}
                          size="small"
                          label={answer?.name || uuid}
                        />
                      );
                    })}
                  </Box>
                )
              }
            >
              {(reasonAnswers || []).map((a) => (
                <MenuItem key={a.uuid} value={a.uuid}>
                  <Checkbox checked={selectedReasons.includes(a.uuid)} />
                  <ListItemText primary={a.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {showOtherReason && (
            <TextField
              fullWidth
              size="small"
              sx={{ mt: 1 }}
              placeholder="Specify other reason"
              value={row.otherReasonText || ""}
              onChange={(e) =>
                onSetOtherReason(row.subjectUUID, e.target.value)
              }
              disabled={readOnly}
            />
          )}
          {showNeedsFollowUp && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!row.needsFollowUp}
                  onChange={() => onToggleNeedsFollowUp(row.subjectUUID)}
                  disabled={readOnly}
                  size="small"
                />
              }
              label="Needs follow-up"
              sx={{ mt: 0.5, ml: -1 }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default RosterRow;
