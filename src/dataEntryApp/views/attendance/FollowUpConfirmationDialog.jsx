import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

const FollowUpConfirmationDialog = ({ open, result, warnings, onClose }) => {
  const created = result?.autoCreatedFollowUps || [];
  const voided = result?.voidedStaleFollowUps || [];
  const skipped = result?.skippedAlreadyFilledFollowUps || [];
  const dangling = warnings || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{"Follow-up encounters"}</DialogTitle>
      <DialogContent>
        {created.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {`${created.length} follow-up encounter${
                created.length === 1 ? "" : "s"
              } scheduled`}
            </Typography>
            <List dense disablePadding>
              {created.map((f) => (
                <ListItem key={f.encounterUUID} disableGutters>
                  <ListItemText
                    primary={f.studentName}
                    secondary={[
                      f.encounterTypeName,
                      f.earliestVisitDateTime
                        ? `Due ${new Date(
                            f.earliestVisitDateTime,
                          ).toLocaleDateString()}`
                        : null,
                      f.maxVisitDateTime
                        ? `Latest ${new Date(
                            f.maxVisitDateTime,
                          ).toLocaleDateString()}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {voided.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {`${voided.length} follow-up${
              voided.length === 1 ? "" : "s"
            } cancelled (${voided
              .map((v) => `${v.studentName} is now Present or reasoned`)
              .join(", ")})`}
          </Alert>
        )}

        {skipped.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {`Follow-up for ${skipped
              .map((s) => s.studentName)
              .join(
                ", ",
              )} was already started — left unchanged. Void manually if needed.`}
          </Alert>
        )}

        {dangling.length > 0 && (
          <Alert severity="warning">
            {dangling.map((w, i) => (
              <div key={i}>{w.message || String(w)}</div>
            ))}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          {"OK"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpConfirmationDialog;
