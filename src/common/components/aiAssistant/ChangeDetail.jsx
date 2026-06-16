import { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { Box, Typography, Button, TextField, Chip, Stack } from "@mui/material";
import { DECISIONS } from "./types";

/**
 * Detail pane of the two-pane HITL view — shows the currently-selected
 * change with full context (kind, form, reason, before/after) and the
 * three action buttons (Yes / No / Edit).
 *
 * Edit mode reveals a TextField that takes Enter to save and Escape to
 * cancel. The parent calls `ref.enterEdit()` to flip edit mode from the
 * keyboard shortcut.
 *
 * Props:
 *  - change: HitlChange
 *  - decision: { decision, value } | undefined
 *  - onDecide: (decision, value?) => void
 */
const ChangeDetail = forwardRef(({ change, decision, onDecide }, ref) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    (change.after && change.after.name) || "",
  );

  // Reset edit state when the selected change changes.
  useEffect(() => {
    setEditing(false);
    setEditValue((change.after && change.after.name) || "");
  }, [change.change_id, change.after]);

  // Expose `enterEdit` so the parent's keyboard handler can trigger it.
  useImperativeHandle(ref, () => ({ enterEdit: () => setEditing(true) }), []);

  const beforeName = (change.before && change.before.name) || "—";
  const proposedAfter = (change.after && change.after.name) || "—";
  const displayedAfter =
    decision?.decision === DECISIONS.EDIT && decision.value
      ? decision.value
      : proposedAfter;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip size="small" label={change.kind} />
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {change.form || "(form)"}
        </Typography>
        {change.field && (
          <Typography variant="caption" color="text.secondary">
            {change.field}
          </Typography>
        )}
      </Stack>

      {/* Reason */}
      {change.reason && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          {change.reason}
        </Typography>
      )}

      {/* Before / After */}
      <Box>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <Box component="strong" sx={{ mr: 1 }}>
            Before:
          </Box>
          <Box
            component="span"
            sx={{ textDecoration: "line-through", color: "text.secondary" }}
          >
            {beforeName}
          </Box>
        </Typography>
        <Typography variant="body2">
          <Box component="strong" sx={{ mr: 1 }}>
            After:
          </Box>
          <Box
            component="span"
            sx={{
              fontWeight: decision?.decision === DECISIONS.EDIT ? 700 : 500,
              color:
                decision?.decision === DECISIONS.EDIT
                  ? "info.dark"
                  : "text.primary",
            }}
          >
            {displayedAfter}
          </Box>
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ mt: "auto" }}>
        {editing ? (
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              autoFocus
              size="small"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Custom value"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onDecide(DECISIONS.EDIT, editValue);
                  setEditing(false);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setEditing(false);
                }
              }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                onDecide(DECISIONS.EDIT, editValue);
                setEditing(false);
              }}
            >
              Save
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={
                decision?.decision === DECISIONS.YES ? "contained" : "outlined"
              }
              color="success"
              onClick={() => onDecide(DECISIONS.YES)}
            >
              ✓ Yes (Y)
            </Button>
            <Button
              size="small"
              variant={
                decision?.decision === DECISIONS.NO ? "contained" : "outlined"
              }
              color="error"
              onClick={() => onDecide(DECISIONS.NO)}
            >
              ✗ No (N)
            </Button>
            <Button
              size="small"
              variant={
                decision?.decision === DECISIONS.EDIT ? "contained" : "outlined"
              }
              onClick={() => setEditing(true)}
            >
              ✎ Edit (E)
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
});

ChangeDetail.displayName = "ChangeDetail";

export default ChangeDetail;
