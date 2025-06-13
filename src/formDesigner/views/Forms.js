import React, { useState } from "react";
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
  const openNewFormDialog = () => setShowNewFormDialog(true);
  const closeNewFormDialog = () => setShowNewFormDialog(false);

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
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
          <FormListing />
        </div>
      </div>
    </Box>
  );
};

export default Forms;
