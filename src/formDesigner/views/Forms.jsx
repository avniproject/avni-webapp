import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import NewFormModal from "../components/NewFormModal";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import FormListing from "../components/FormListing";
import Box from "@mui/material/Box";
import { Title } from "react-admin";

const Forms = (props) => {
  const [showNewFormDialog, setShowNewFormDialog] = useState(false);
  const isChatOpen = useSelector((state) => state.app.isChatOpen);
  const openNewFormDialog = useCallback(() => setShowNewFormDialog(true), []);
  const closeNewFormDialog = useCallback(() => setShowNewFormDialog(false), []);

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        width: isChatOpen ? "calc(80%)" : "calc(100%)",
        transition: "width 0.3s ease",
      }}
    >
      <Title title="Forms" />
      <FormListing {...props} onNewFormClick={openNewFormDialog} />
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={closeNewFormDialog}
        aria-labelledby="customized-dialog-title"
        open={showNewFormDialog}
      >
        <DialogTitle id="customized-dialog-title" onClose={closeNewFormDialog}>
          New Form
          <IconButton
            style={{ float: "right" }}
            onClick={closeNewFormDialog}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <NewFormModal {...props} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Forms;
