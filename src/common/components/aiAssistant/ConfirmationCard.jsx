import { useRef, useState } from "react";
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
import ChangeMasterList from "./ChangeMasterList";
import ChangeDetail from "./ChangeDetail";
import { useKeyboardNav } from "./useKeyboardNav";

/**
 * HITL confirmation surface. Two layouts share state and the `onResolve`
 * contract — the picker at the bottom of this component swaps between
 * them based on `isMaximised` and the change count.
 *
 *  - Compact (default): vertical list of full cards with internal scroll.
 *    Fine for small N; what we shipped first.
 *  - Master-detail (≥ MULTI_PANE_THRESHOLD changes AND maximised): list
 *    on the left, focused change on the right, keyboard nav (↑↓/Y/N/E/⏎).
 *    Built for 10+ change runs where scrolling becomes painful.
 *
 * Props:
 *  - pendingChanges: { interrupt_id, changes: [{change_id, form, kind, before, after, reason}] }
 *  - onResolve: (resolutions: [{change_id, decision, value?}]) => Promise<boolean>
 *  - isMaximised: boolean — true when the side panel is in fullscreen mode
 */
const MULTI_PANE_THRESHOLD = 8;

const ConfirmationCard = ({ pendingChanges, onResolve, isMaximised }) => {
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
      for (const c of pendingChanges.changes) {
        if (!kindFilter || c.kind === kindFilter) {
          next[c.change_id] = { decision, value: "" };
        }
      }
      return next;
    });
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
  const useTwoPane = isMaximised && totalCount >= MULTI_PANE_THRESHOLD;

  if (useTwoPane) {
    return (
      <MasterDetailLayout
        changes={pendingChanges.changes}
        decisions={decisions}
        decidedCount={decidedCount}
        allDecided={allDecided}
        submitting={submitting}
        setDecision={setDecision}
        setBulkDecisions={setBulkDecisions}
        onSubmit={submit}
      />
    );
  }

  return (
    <CompactLayout
      changes={pendingChanges.changes}
      decisions={decisions}
      decidedCount={decidedCount}
      totalCount={totalCount}
      allDecided={allDecided}
      submitting={submitting}
      setDecision={setDecision}
      setBulkDecisions={setBulkDecisions}
      onSubmit={submit}
    />
  );
};

// ── Compact layout (default; what we shipped first) ─────────────────────────

const CompactLayout = ({
  changes,
  decisions,
  decidedCount,
  totalCount,
  allDecided,
  submitting,
  setDecision,
  setBulkDecisions,
  onSubmit,
}) => (
  <Box
    sx={{
      p: 2,
      background: "linear-gradient(180deg, #f5f8fc 0%, #eaf1f8 100%)",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
      borderTop: "3px solid",
      borderColor: "primary.main",
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
        {totalCount} change(s) need your confirmation
        {decidedCount > 0 && ` — ${decidedCount}/${totalCount} decided`}
      </Typography>
      {totalCount > 1 && (
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
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        pr: 1,
        mb: 1.5,
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
        {changes.map((change, i) => (
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
  </Box>
);

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

// ── Master-detail layout (≥ MULTI_PANE_THRESHOLD changes AND maximised) ────

const MasterDetailLayout = ({
  changes,
  decisions,
  decidedCount,
  allDecided,
  submitting,
  setDecision,
  setBulkDecisions,
  onSubmit,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const detailRef = useRef(null);
  const totalCount = changes.length;
  const selectedChange = changes[selectedIndex];

  const clampedSetIndex = (next) =>
    setSelectedIndex(Math.max(0, Math.min(totalCount - 1, next)));

  const advance = () => clampedSetIndex(selectedIndex + 1);

  useKeyboardNav({
    enabled: true,
    onMove: (delta) => clampedSetIndex(selectedIndex + delta),
    onDecide: (decision) => {
      setDecision(selectedChange.change_id, decision, "");
      advance();
    },
    onEnterEdit: () => detailRef.current?.enterEdit?.(),
    onApply: () => {
      if (!submitting) onSubmit();
    },
    applyReady: allDecided && !submitting,
  });

  return (
    <Box
      sx={{
        p: 2,
        background: "linear-gradient(180deg, #f5f8fc 0%, #eaf1f8 100%)",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        borderTop: "3px solid",
        borderColor: "primary.main",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          {totalCount} changes — {decidedCount}/{totalCount} decided
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ↑↓ navigate · Y / N decide · E edit · Enter apply
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <ChangeMasterList
          changes={changes}
          decisions={decisions}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onBulkDecide={setBulkDecisions}
        />
        <ChangeDetail
          ref={detailRef}
          change={selectedChange}
          decision={decisions[selectedChange.change_id]}
          onDecide={(decision, value) =>
            setDecision(selectedChange.change_id, decision, value)
          }
        />
      </Box>

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
        Apply {totalCount} decision{totalCount === 1 ? "" : "s"}
      </Button>
    </Box>
  );
};

export default ConfirmationCard;
