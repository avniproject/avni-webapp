import React, { useState } from "react";
import NewFormModal from "../components/NewFormModal";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import FormListing from "../components/FormListing";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";
import { connect } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const Forms = props => {
  const [showNewFormDialog, setShowNewFormDialog] = useState(false);
  const openNewFormDialog = () => setShowNewFormDialog(true);
  const closeNewFormDialog = () => setShowNewFormDialog(false);

  const canEditForms = UserInfo.hasPrivilege(props.userInfo, Privilege.PrivilegeType.EditForm);
  console.log(
    "Can edit forms",
    canEditForms,
    "User privilege",
    props.userInfo,
    "Need",
    Privilege.PrivilegeType.EditForm
  );
  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Title title="Forms" />
      <div className="container">
        <div>
          {canEditForms && (
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={openNewFormDialog} name="New Form" />
            </div>
          )}
          {canEditForms && (
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
          )}
          <FormListing />
        </div>
      </div>
    </Box>
  );
};
const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(Forms);
