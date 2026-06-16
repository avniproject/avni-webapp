import { useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Edit,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { DECISIONS } from "./types";

/**
 * Master pane of the two-pane HITL view.
 *
 * Renders bulk-action buttons at the top (Accept all / Reject all, plus
 * per-kind shortcuts when multiple change kinds are present) and a
 * scrollable list of changes below with status icons.
 *
 * Props:
 *  - changes: HitlChange[]
 *  - decisions: { [change_id]: { decision, value } }
 *  - selectedIndex: number
 *  - onSelect: (index: number) => void
 *  - onBulkDecide: (decision: "yes"|"no", kindFilter?: string) => void
 */
const ChangeMasterList = ({
  changes,
  decisions,
  selectedIndex,
  onSelect,
  onBulkDecide,
}) => {
  const kindCounts = useMemo(() => {
    const map = new Map();
    for (const c of changes) {
      map.set(c.kind, (map.get(c.kind) || 0) + 1);
    }
    return [...map.entries()];
  }, [changes]);

  const hasMultipleKinds = kindCounts.length > 1;

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        gap: 1,
      }}
    >
      {/* Bulk actions */}
      <Box>
        <ButtonGroup
          size="small"
          fullWidth
          sx={{ mb: hasMultipleKinds ? 0.75 : 0 }}
        >
          <Button
            color="success"
            onClick={() => onBulkDecide(DECISIONS.YES)}
            sx={{ fontWeight: 600 }}
          >
            Accept all
          </Button>
          <Button
            color="error"
            onClick={() => onBulkDecide(DECISIONS.NO)}
            sx={{ fontWeight: 600 }}
          >
            Reject all
          </Button>
        </ButtonGroup>
        {hasMultipleKinds && (
          <Stack spacing={0.25}>
            {kindCounts.map(([kind, count]) => (
              <Button
                key={kind}
                size="small"
                variant="text"
                fullWidth
                onClick={() => onBulkDecide(DECISIONS.YES, kind)}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: 12,
                  py: 0.25,
                }}
              >
                ✓ Accept {count} {kind}
              </Button>
            ))}
          </Stack>
        )}
      </Box>

      {/* Scrollable list */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          backgroundColor: "background.paper",
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <List dense disablePadding>
          {changes.map((change, i) => {
            const decision = decisions[change.change_id];
            const selected = i === selectedIndex;
            return (
              <ListItemButton
                key={change.change_id}
                selected={selected}
                onClick={() => onSelect(i)}
                sx={{
                  py: 0.5,
                  borderLeft: "3px solid",
                  borderLeftColor: selected ? "primary.main" : "transparent",
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    "&:hover": { backgroundColor: "primary.light" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <StatusIcon decision={decision} />
                </ListItemIcon>
                <ListItemText
                  primary={`#${i + 1} ${change.form || "(form)"}`}
                  secondary={
                    <Chip
                      size="small"
                      label={change.kind}
                      sx={{
                        height: 16,
                        fontSize: 10,
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  }
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: selected ? 600 : 500,
                    noWrap: true,
                  }}
                  secondaryTypographyProps={{ component: "div" }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

const StatusIcon = ({ decision }) => {
  if (!decision) {
    return (
      <RadioButtonUnchecked sx={{ fontSize: 16, color: "text.disabled" }} />
    );
  }
  if (decision.decision === DECISIONS.YES) {
    return <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />;
  }
  if (decision.decision === DECISIONS.NO) {
    return <Cancel sx={{ fontSize: 16, color: "error.main" }} />;
  }
  if (decision.decision === DECISIONS.EDIT) {
    return <Edit sx={{ fontSize: 16, color: "info.main" }} />;
  }
  return <RadioButtonUnchecked sx={{ fontSize: 16, color: "text.disabled" }} />;
};

export default ChangeMasterList;
