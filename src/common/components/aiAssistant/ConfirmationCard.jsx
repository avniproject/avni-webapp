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
 * Inline HITL confirmation card. Per
 * specs/INLINE_AUTOPILOT_CARDS_SDD.md the card lives in the chat
 * messages array — active until the user applies decisions, then
 * frozen as read-only (controls disabled, no retained per-change
 * selection — the user's chosen decisions live in the user-side text
 * bubble appended right after via `buildDecisionsSummary`).
 *
 * Props:
 *  - msg: { type: "hitl", interrupt_id, changes: [...], resolved: bool }
 *  - resolved: boolean — when true, render frozen (no inputs)
 *  - onResolve: (interruptId, resolutions) => Promise<boolean>
 */
const ConfirmationCard = ({ msg, resolved, onResolve }) => {
  const [decisions, setDecisions] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setDecision = (changeId, decision, value = "") => {
    setDecisions((prev) => ({
      ...prev,
      [changeId]: { decision, value },
    }));
  };

  const setBulkDecisions = (decision, kindFilter) => {
    setDecisions((prev) => {
      const next = { ...prev };
      for (const c of msg.changes) {
        if (!kindFilter || c.kind === kindFilter) {
          next[c.change_id] = { decision, value: "" };
        }
      }
      return next;
    });
  };

  const allDecided = msg.changes.every((c) => decisions[c.change_id]);

  const submit = async () => {
    setSubmitting(true);
    const resolutions = msg.changes.map((c) => ({
      change_id: c.change_id,
      decision: decisions[c.change_id].decision,
      value: decisions[c.change_id].value || "",
    }));
    await onResolve(msg.interrupt_id, resolutions);
    setSubmitting(false);
  };

  const decidedCount = Object.keys(decisions).length;
  const totalCount = msg.changes.length;

  return (
    <CompactLayout
      changes={msg.changes}
      decisions={decisions}
      decidedCount={decidedCount}
      totalCount={totalCount}
      allDecided={allDecided}
      submitting={submitting}
      resolved={resolved}
      setDecision={setDecision}
      setBulkDecisions={setBulkDecisions}
      onSubmit={submit}
    />
  );
};

// ── Compact layout — inline in chat ─────────────────────────────────────────

const CompactLayout = ({
  changes,
  decisions,
  decidedCount,
  totalCount,
  allDecided,
  submitting,
  resolved,
  setDecision,
  setBulkDecisions,
  onSubmit,
}) => (
  <Box
    sx={{
      p: 2,
      mb: 1.5,
      background: "linear-gradient(180deg, #f5f8fc 0%, #eaf1f8 100%)",
      display: "flex",
      flexDirection: "column",
      border: "1px solid",
      borderColor: resolved ? "divider" : "primary.main",
      borderRadius: 2,
      opacity: resolved ? 0.75 : 1,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 1,
        flexWrap: "wrap",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
        {resolved
          ? `${totalCount} change(s) — resolved`
          : `${totalCount} change(s) need your confirmation${decidedCount > 0 ? ` — ${decidedCount}/${totalCount} decided` : ""}`}
      </Typography>
      {!resolved && totalCount > 1 && (
        <Box sx={{ display: "flex", gap: 0.75 }}>
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => setBulkDecisions(DECISIONS.YES)}
            sx={{ borderRadius: 1.5, fontWeight: 600, py: 0.25 }}
          >
            Yes to all
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => setBulkDecisions(DECISIONS.NO)}
            sx={{ borderRadius: 1.5, fontWeight: 600, py: 0.25 }}
          >
            No to all
          </Button>
        </Box>
      )}
    </Box>
    <Stack spacing={1.25} sx={{ mb: resolved ? 0 : 1.5 }}>
      {changes.map((change, i) => (
        <ChangeCard
          key={change.change_id}
          index={i + 1}
          change={change}
          decision={decisions[change.change_id]}
          resolved={resolved}
          onDecide={(decision, value) =>
            setDecision(change.change_id, decision, value)
          }
        />
      ))}
    </Stack>
    {!resolved && (
      <Button
        fullWidth
        variant="contained"
        disabled={!allDecided || submitting}
        onClick={onSubmit}
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
    )}
  </Box>
);

const ChangeCard = ({ index, change, decision, resolved, onDecide }) => {
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
      <Typography variant="body2" sx={{ fontSize: 13, mb: resolved ? 0 : 1 }}>
        <strong>After:</strong> {(change.after && change.after.name) || "—"}
      </Typography>

      {resolved ? null : editing ? (
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
