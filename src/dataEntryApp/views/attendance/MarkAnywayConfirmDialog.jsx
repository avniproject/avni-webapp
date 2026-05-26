import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { prettyDate } from "./utils/dates";

const MarkAnywayConfirmDialog = ({ open, dateIso, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{"Mark anyway?"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`Class is not in session on ${prettyDate(dateIso)} per the calendar. Mark attendance anyway?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{"Cancel"}</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          {"Mark anyway"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarkAnywayConfirmDialog;
