import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Modal from "@material-ui/core/Modal";
import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { get } from "lodash";
import { makeStyles } from "@material-ui/core";
import http from "common/utils/httpClient";
import TextField from "@material-ui/core/TextField";
import { AlertModal } from "./AlertModal";
import WarningIcon from "@material-ui/icons/Warning";

const useStyles = makeStyles(theme => ({
  paper: {
    position: "absolute",
    width: 800,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  },
  deleteButton: {
    backgroundColor: "red"
  },
  progress: {
    position: "absolute",
    top: "30%",
    left: "50%",
    zIndex: 1
  }
}));

export const DeleteData = ({ openModal, setOpenModal, orgName }) => {
  const classes = useStyles();

  const [deleteMetadata, setDeleteMetadata] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState();
  const [showAlert, setShowAlert] = React.useState(false);
  const [message, setMessage] = React.useState({});

  const warningMessage =
    "This will remove all transactional data such as subjects, " +
    "program enrolments and encounters entered through the Field App. Do you want to continue?";
  const deleteMetadataMessage =
    "Delete Everything! (This will delete all metadata such as subject types, " +
    "encounter types and form definitions)";
  const deleteClientDataMessage =
    "This only deletes data from the server database. " +
    "Please make sure you delete data from the field app manually.";

  const deleteData = () => {
    setOpenModal(false);
    setLoading(true);
    http
      .delete(`/implementation/delete?deleteMetadata=${deleteMetadata}`)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
          setMessage({ title: "Successfully deleted data", content: deleteClientDataMessage });
          setShowAlert(true);
        }
      })
      .catch(error => {
        setLoading(false);
        const errorMessage = `${get(error, "response.data") ||
          get(error, "message") ||
          "unknown error"}`;
        setMessage({ title: `Error occurred while deleting data`, content: errorMessage });
        setShowAlert(true);
      });
  };

  return (
    <div>
      <Modal disableBackdropClick open={openModal} onClose={() => setOpenModal(false)}>
        <Grid
          container
          direction={"column"}
          spacing={3}
          className={classes.paper}
          style={{ top: "25%", left: "30%" }}
        >
          <Grid item container spacing={1} xs={12}>
            <Grid item xs={1}>
              {" "}
              <WarningIcon color={"error"} style={{ fontSize: "40px" }} />
            </Grid>
            <Grid item xs={11}>
              {warningMessage}
            </Grid>
          </Grid>
          <Grid item>{deleteClientDataMessage}</Grid>
          <Grid item>
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
          <Grid item>
            <TextField
              fullWidth
              helperText="Please enter organisation name to proceed"
              onChange={event => setConfirmText(event.target.value)}
            />
          </Grid>
          <Grid item container spacing={3}>
            <Grid item>
              <Button variant="contained" color="primary" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                className={classes.deleteButton}
                onClick={deleteData}
                disabled={orgName !== confirmText}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
      <Modal disableBackdropClick open={loading}>
        <CircularProgress size={150} className={classes.progress} />
      </Modal>
      <AlertModal message={message} setShowAlert={setShowAlert} showAlert={showAlert} />
    </div>
  );
};
