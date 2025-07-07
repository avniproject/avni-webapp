import { useState, useCallback } from "react";
import NewFormModal from "../components/NewFormModal";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import FormListing from "../components/FormListing";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";

const Forms = props => {
  const [showNewFormDialog, setShowNewFormDialog] = useState(false);
  const openNewFormDialog = useCallback(() => setShowNewFormDialog(true), []);
  const closeNewFormDialog = useCallback(() => setShowNewFormDialog(false), []);

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title="Forms" />
      <div className="container">
        <div>
          <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
            <CreateComponent onSubmit={openNewFormDialog} name="New Form" />
          </div>
          <Dialog fullWidth maxWidth="xs" onClose={closeNewFormDialog} aria-labelledby="customized-dialog-title" open={showNewFormDialog}>
            <DialogTitle id="customized-dialog-title" onClose={closeNewFormDialog}>
              New Form
              <IconButton style={{ float: "right" }} onClick={closeNewFormDialog} size="large">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <NewFormModal {...props} />
            </DialogContent>
          </Dialog>
          <div style={{ maxWidth: "100%", overflowX: "auto" }}>
            <FormListing />
          </div>
        </div>
      </div>
    </Box>
  );
};
export default Forms;
