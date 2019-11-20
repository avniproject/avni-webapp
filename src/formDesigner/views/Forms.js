import React, { useState } from "react";
import NewFormModal from "../components/NewFormModal";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import FormListing from "../components/FormListing";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";

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
            <Button variant="outlined" color="secondary" onClick={openNewFormDialog}>
              {" "}
              New Form{" "}
            </Button>
          </div>
          <Dialog
            fullWidth
            maxWidth="xs"
            onClose={closeNewFormDialog}
            aria-labelledby="customized-dialog-title"
            open={showNewFormDialog}
          >
            <DialogTitle id="customized-dialog-title" onClose={closeNewFormDialog}>
              New Form
              <IconButton style={{ float: "right" }} onClick={closeNewFormDialog}>
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
