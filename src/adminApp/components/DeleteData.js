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

const useStyles = makeStyles(theme => ({
  paper: {
    position: "absolute",
    width: 600,
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

export const DeleteData = ({ openModal, setOpenModal }) => {
  const classes = useStyles();

  const [deleteMetadata, setDeleteMetadata] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const warningMessage =
    "This will remove all transactional data such as subjects, " +
    "program enrolments and encounters entered through the Field App. Do you want to continue?";
  const deleteMetadataMessage =
    "Also delete metadata created through the system " +
    "(This will delete everything except users, catchments and locations)";

  const deleteData = () => {
    setOpenModal(false);
    setLoading(true);
    http
      .delete(`/implementation/delete?deleteMetadata=${deleteMetadata}`)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
          alert("Successfully deleted data.");
        }
      })
      .catch(error => {
        setLoading(false);
        const errorMessage = `${get(error, "response.data") ||
          get(error, "message") ||
          "unknown error"}`;
        alert(`Error occurred while deleting data. ${errorMessage}`);
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
          style={{ top: "30%", left: "40%" }}
        >
          <Grid item>{warningMessage}</Grid>
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
    </div>
  );
};
