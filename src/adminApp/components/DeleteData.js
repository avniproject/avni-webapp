import { styled } from '@mui/material/styles';
import { Grid, FormControlLabel, Checkbox, Button, Modal, TextField } from "@mui/material";
import React, { useEffect, useState, Fragment } from "react";
import { get } from "lodash";
import http from "common/utils/httpClient";
import { AlertModal } from "./AlertModal";
import { Warning } from "@mui/icons-material";
import ActivityIndicatorModal from "../../common/components/ActivityIndicatorModal";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

const StyledModalContent = styled(Grid)(({ theme }) => ({
  position: "absolute",
  width: 800,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  top: "25%",
  left: "30%",
}));

const StyledDeleteButton = styled(Button)(({ theme }) => ({
  backgroundColor: "red",
}));

const StyledWarningIcon = styled(Warning)(({ theme }) => ({
  fontSize: "40px",
}));

export const DeleteData = ({
                             openModal,
                             setOpenModal,
                             orgName,
                             hasOrgMetadataDeletionPrivilege,
                             hasOrgAdminConfigDeletionPrivilege,
                             setDataDeletedIndicator,
                           }) => {
  const [deleteMetadata, setDeleteMetadata] = useState(false);
  const [deleteAdminConfig, setDeleteAdminConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState();
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState({});

  useEffect(() => {
    if (!deleteMetadata) {
      setDeleteAdminConfig(false);
    }
  }, [deleteMetadata]);

  const warningMessage =
    "This will remove all transactional data such as subjects, program enrolments and encounters entered through the Field App. Do you want to continue?";
  const deleteMetadataMessage =
    "Delete all Metadata (such as subject types, encounter types and form definitions) except admin related configurations";
  const deleteAdminConfigurationMessage = "Delete all admin configurations except Administrators";
  const deleteClientDataMessage =
    "This only deletes data from the server database. Please make sure you delete data from the field app manually.";

  const deleteData = () => {
    setOpenModal(false);
    setLoading(true);
    http
      .delete(`/implementation/delete?deleteMetadata=${deleteMetadata}&deleteAdminConfig=${deleteAdminConfig}`)
      .then(res => {
        if (res.status === 200) {
          setDataDeletedIndicator(prevValue => !prevValue);
          setLoading(false);
          setMessage({ title: "Successfully deleted data", content: deleteClientDataMessage });
          setShowAlert(true);
        }
      })
      .catch(error => {
        setLoading(false);
        const errorMessage = `${get(error, "response.data") || get(error, "message") || "unknown error"}`;
        setMessage({ title: `Error occurred while deleting data`, content: errorMessage });
        setShowAlert(true);
      });
  };

  return (
    <Fragment>
      <Modal onClose={MuiComponentHelper.getDialogClosingHandler(() => setOpenModal(false))} open={openModal}>
        <StyledModalContent container direction="column" spacing={3}>
          <Grid container spacing={1} size={12}>
            <Grid size={1}>
              <StyledWarningIcon color="error" />
            </Grid>
            <Grid size={11}>{warningMessage}</Grid>
          </Grid>
          <Grid>{deleteClientDataMessage}</Grid>
          {hasOrgMetadataDeletionPrivilege && (
            <Grid>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteMetadata}
                    onChange={event => setDeleteMetadata(event.target.checked)}
                    name="deleteMetadata"
                    color="primary"
                  />
                }
                label={deleteMetadataMessage}
              />
            </Grid>
          )}
          {hasOrgAdminConfigDeletionPrivilege && deleteMetadata && (
            <Grid>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteAdminConfig}
                    onChange={event => setDeleteAdminConfig(event.target.checked)}
                    name="deleteAdminConfig"
                    color="primary"
                  />
                }
                label={deleteAdminConfigurationMessage}
              />
            </Grid>
          )}
          <Grid>
            <TextField
              fullWidth
              helperText="Please enter organisation name to proceed"
              onChange={event => setConfirmText(event.target.value)}
            />
          </Grid>
          <Grid container spacing={3}>
            <Grid>
              <Button variant="contained" color="primary" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
            </Grid>
            <Grid>
              <StyledDeleteButton
                variant="contained"
                color="secondary"
                onClick={deleteData}
                disabled={orgName !== confirmText}
              >
                Delete
              </StyledDeleteButton>
            </Grid>
          </Grid>
        </StyledModalContent>
      </Modal>
      <ActivityIndicatorModal open={loading} />
      <AlertModal message={message} setShowAlert={setShowAlert} showAlert={showAlert} />
    </Fragment>
  );
};