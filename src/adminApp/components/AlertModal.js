import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

export const AlertModal = ({ message, showAlert, setShowAlert, className }) => {
  return (
    <Dialog open={showAlert} onClose={MuiComponentHelper.getDialogClosingHandler(() => setShowAlert(false))}>
      <DialogTitle>{message.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message.content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={() => setShowAlert(false)}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
