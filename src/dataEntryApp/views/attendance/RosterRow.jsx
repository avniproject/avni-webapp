import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@mui/material";

const RosterRow = ({
  row,
  index,
  reasonAnswers,
  followUpEncounterTypeUuid,
  onTogglePresence,
  onSetReason,
  readOnly,
}) => {
  const isAbsent = row.status === "Absent";
  const selectedReasons = row.reasonConceptUUIDs || [];
  const isBlankReason = isAbsent && selectedReasons.length === 0;
  const showFollowUpWarning =
    !readOnly && isBlankReason && !!followUpEncounterTypeUuid;

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
          {showFollowUpWarning && (
            <Typography
              variant="caption"
              sx={{ color: "warning.dark", display: "block", mt: 0.5 }}
            >
              ⚠ No reasons selected — a follow-up encounter will be
              auto-created on save.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default RosterRow;
