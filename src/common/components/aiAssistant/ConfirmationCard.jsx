import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import { DECISIONS } from "./types";

/**
 * Renders pending HITL changes as a vertical list of cards. Each card has
 * Yes / No / Edit actions; "Edit" reveals a text input. When every card has
 * a decision, the "Apply" button submits the structured resolutions to the
 * backend (SDD §4.2).
 *
 * Props:
 *  - pendingChanges: { interrupt_id, changes: [{change_id, form, kind, before, after, reason}] }
 *  - onResolve: (resolutions: [{change_id, decision, value?}]) => Promise<boolean>
 */
const ConfirmationCard = ({ pendingChanges, onResolve }) => {
  const [decisions, setDecisions] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setDecision = (changeId, decision, value = "") => {
    setDecisions((prev) => ({
      ...prev,
      [changeId]: { decision, value },
    }));
  };

  const allDecided = pendingChanges.changes.every(
    (c) => decisions[c.change_id],
  );

  const submit = async () => {
    setSubmitting(true);
    const resolutions = pendingChanges.changes.map((c) => ({
      change_id: c.change_id,
      decision: decisions[c.change_id].decision,
      value: decisions[c.change_id].value || "",
    }));
    await onResolve(resolutions);
    setSubmitting(false);
  };

  const decidedCount = Object.keys(decisions).length;
  const totalCount = pendingChanges.changes.length;

  return (
    <Box
      sx={{
        p: 2,
        background: "linear-gradient(180deg, #fff8e1 0%, #fff3c4 100%)",
        display: "flex",
        flexDirection: "column",
        // Take all remaining space inside the panel (panel parent uses
        // flex column + overflow:hidden). minHeight:0 lets the internal
        // scroller actually shrink instead of overflowing the panel and
        // pushing the chat composer off-screen.
        flex: 1,
        minHeight: 0,
        borderTop: "1px solid",
        borderColor: "warning.main",
      }}
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        {totalCount} change(s) need your confirmation
        {decidedCount > 0 && ` — ${decidedCount}/${totalCount} decided`}
      </Typography>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          pr: 1,
          mb: 1.5,
          // Make the scrollbar visible so users know there's more below.
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.25)",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: 4,
          },
        }}
      >
        <Stack spacing={1.25}>
          {pendingChanges.changes.map((change, i) => (
            <ChangeCard
              key={change.change_id}
              index={i + 1}
              change={change}
              decision={decisions[change.change_id]}
              onDecide={(decision, value) =>
                setDecision(change.change_id, decision, value)
              }
            />
          ))}
        </Stack>
      </Box>
      <Button
        fullWidth
        variant="contained"
        disabled={!allDecided || submitting}
        onClick={submit}
        sx={{
          py: 1.1,
          borderRadius: 2,
          fontWeight: 600,
          letterSpacing: 0.3,
          boxShadow: 2,
        }}
      >
        Apply decisions
      </Button>
    </Box>
  );
};

const ChangeCard = ({ index, change, decision, onDecide }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    (change.after && change.after.name) || "",
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        borderColor: "rgba(0,0,0,0.12)",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Chip size="small" label={`#${index}`} />
        <Typography variant="caption" color="text.secondary">
          {change.form} · {change.kind}
        </Typography>
      </Box>
      {change.reason && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 0.5 }}
        >
          {change.reason}
        </Typography>
      )}
      <Typography variant="body2" sx={{ fontSize: 13 }}>
        <strong>Before:</strong>{" "}
        <span style={{ textDecoration: "line-through" }}>
          {(change.before && change.before.name) || "—"}
        </span>
      </Typography>
      <Typography variant="body2" sx={{ fontSize: 13, mb: 1 }}>
        <strong>After:</strong> {(change.after && change.after.name) || "—"}
      </Typography>

      {editing ? (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Custom value"
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
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            size="small"
            variant={
              decision?.decision === DECISIONS.YES ? "contained" : "outlined"
            }
            color="success"
            onClick={() => onDecide(DECISIONS.YES)}
          >
            Yes
          </Button>
          <Button
            size="small"
            variant={
              decision?.decision === DECISIONS.NO ? "contained" : "outlined"
            }
            color="error"
            onClick={() => onDecide(DECISIONS.NO)}
          >
            No
          </Button>
          <Button
            size="small"
            variant={
              decision?.decision === DECISIONS.EDIT ? "contained" : "outlined"
            }
            onClick={() => setEditing(true)}
          >
            {decision?.decision === DECISIONS.EDIT
              ? `Edit: ${decision.value}`
              : "Edit"}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ConfirmationCard;
