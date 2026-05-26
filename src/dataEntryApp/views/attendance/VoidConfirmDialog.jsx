import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const VoidConfirmDialog = ({
  open,
  attendanceTypeName,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{"Void this attendance session?"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {attendanceTypeName ? (
            <>
              <strong>{attendanceTypeName}</strong>
              <br />
            </>
          ) : null}
          Linked auto-created follow-ups will also be voided (only those not yet
          filled).
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{"Cancel"}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {"Void"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoidConfirmDialog;
