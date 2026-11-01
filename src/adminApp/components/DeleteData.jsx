import { styled } from "@mui/material/styles";
import {
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
  Modal,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useEffect, useRef, useState, Fragment } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { extractServerErrorMessage } from "common/utils/serverErrorMessage";
import { AlertModal } from "./AlertModal";
import { Warning } from "@mui/icons-material";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

// #1639: the deletion runs as a background job on the server; this screen starts it and polls its status.
export const DELETE_JOB_POLLING_INTERVAL = 3000;
// A large organisation, or a job queued behind an upload, can outlast this; then we say it may still be running.
export const DELETE_JOB_MAX_POLLING_TIME = 600000;
const MAX_CONSECUTIVE_POLL_ERRORS = 3;
const DELETE_JOB_STATUS_URL = "/implementation/delete/job/status";

// REQUESTED is ours (between pressing Delete and the server answering); TIMEOUT is ours (polling window over).
const isJobRunning = (status) =>
  ["REQUESTED", "STARTING", "STARTED"].includes(status);
const isJobFinished = (status) => ["COMPLETED", "FAILED"].includes(status);

const StyledModalContent = styled(Grid)(({ theme }) => ({
  position: "absolute",
  width: 800,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  top: "25%",
  left: "30%",
}));

const StyledDeleteButton = styled(Button)({
  backgroundColor: "red",
});

const StyledWarningIcon = styled(Warning)({
  fontSize: "40px",
});

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
  const [confirmText, setConfirmText] = useState();
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState({});
  // { status, exitMessage } of the deletion job this screen is following, or null.
  const [job, setJob] = useState(null);
  // A job is being followed (started here, or found running on open).
  const trackingRef = useRef(false);
  // Bumped whenever polling stops, so answers that arrive late are discarded.
  const pollGenerationRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!deleteMetadata) {
      setDeleteAdminConfig(false);
    }
  }, [deleteMetadata]);

  const stopPolling = () => {
    pollGenerationRef.current += 1;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  const warningMessage =
    "This will remove all transactional data such as subjects, program enrolments and encounters entered through the Field App. Do you want to continue?";
  const deleteMetadataMessage =
    "Delete all Metadata (such as subject types, encounter types and form definitions) except admin related configurations";
  const deleteAdminConfigurationMessage =
    "Delete all admin configurations except Administrators";
  const deleteClientDataMessage =
    "This only deletes data from the server database. Please make sure you delete data from the field app manually.";

  const showJobStatus = ({ status, exitMessage }) => {
    setJob((prev) =>
      prev && prev.status === status && prev.exitMessage === exitMessage
        ? prev
        : { status, exitMessage },
    );
    if (isJobFinished(status)) {
      stopPolling();
      if (status === "COMPLETED") {
        setDataDeletedIndicator((prevValue) => !prevValue);
      }
    }
  };

  const pollJobStatus = () => {
    stopPolling();
    const generation = pollGenerationRef.current;
    const isCurrent = () => generation === pollGenerationRef.current;
    const startTime = Date.now();
    let consecutiveErrors = 0;

    intervalRef.current = setInterval(() => {
      if (Date.now() - startTime > DELETE_JOB_MAX_POLLING_TIME) {
        stopPolling();
        const lastLook = pollGenerationRef.current;
        // The deletion can outlast the polling window. Ask once more before saying anything:
        // if it has finished, say so, rather than that it is taking long (as in template apply, #1640).
        http
          .get(DELETE_JOB_STATUS_URL)
          .then((response) => {
            if (lastLook !== pollGenerationRef.current) return;
            const status = response.data?.status;
            if (isJobFinished(status)) showJobStatus(response.data);
            else setJob({ status: "TIMEOUT" });
          })
          .catch(() => {
            if (lastLook === pollGenerationRef.current)
              setJob({ status: "TIMEOUT" });
          });
        return;
      }

      http
        .get(DELETE_JOB_STATUS_URL)
        .then((response) => {
          if (!isCurrent()) return;
          consecutiveErrors = 0;
          const { status, exitMessage } = response.data || {};
          // NOT_FOUND right after starting: the job is not recorded yet, keep showing that it is starting.
          if (status === "NOT_FOUND") return;
          showJobStatus({ status, exitMessage });
        })
        .catch(() => {
          if (!isCurrent()) return;
          consecutiveErrors += 1;
          if (consecutiveErrors >= MAX_CONSECUTIVE_POLL_ERRORS) {
            stopPolling();
            setJob({ status: "TIMEOUT" });
          }
        });
    }, DELETE_JOB_POLLING_INTERVAL);
  };

  // On open, and whenever the confirmation is opened again: if a deletion is already running for this
  // organisation (started earlier, maybe from another tab), show its progress instead of offering another.
  useEffect(() => {
    if (trackingRef.current) return;
    http
      .get(DELETE_JOB_STATUS_URL)
      .then((response) => {
        const { status, exitMessage } = response.data || {};
        if (trackingRef.current || !isJobRunning(status)) return;
        trackingRef.current = true;
        setOpenModal(false);
        setJob({ status, exitMessage });
        pollJobStatus();
      })
      .catch(() => {
        // No status (older server, or no privilege to read it): the screen works as before.
      });
  }, [openModal]);

  const deleteData = () => {
    trackingRef.current = true;
    setOpenModal(false);
    setJob({ status: "REQUESTED" });
    http
      .post(
        `/implementation/delete/job?deleteMetadata=${deleteMetadata}&deleteAdminConfig=${deleteAdminConfig}`,
      )
      .then(() => pollJobStatus())
      .catch((error) => {
        trackingRef.current = false;
        setJob(null);
        const status = error?.response?.status;
        setMessage({
          title: "Could not start deleting data",
          content:
            status === 403
              ? "You do not have the privilege to delete this data."
              : extractServerErrorMessage(error, "unknown error"),
        });
        setShowAlert(true);
      });
  };

  const closeJobDialog = () => {
    stopPolling();
    trackingRef.current = false;
    setJob(null);
  };

  const jobDialogTitle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Data deleted";
      case "FAILED":
        return "Could not delete data";
      case "TIMEOUT":
        return "Deleting data is taking longer than usual";
      case "STARTED":
        return "Deleting data: in progress";
      default:
        return "Starting to delete data";
    }
  };

  const jobDialogContent = ({ status, exitMessage }) => {
    switch (status) {
      case "COMPLETED":
        return deleteClientDataMessage;
      case "FAILED":
        return exitMessage || "The deletion stopped with an error.";
      case "TIMEOUT":
        return "The deletion may still be running on the server. Open this page again in a few minutes to see whether it has finished, before starting another deletion.";
      case "STARTED":
        return "This can take several minutes for a large organisation.";
      default:
        return "The deletion will start shortly. It can wait behind other background jobs, such as an upload.";
    }
  };

  const jobInProgress = job && isJobRunning(job.status);

  return (
    <Fragment>
      <Modal
        onClose={MuiComponentHelper.getDialogClosingHandler(() =>
          setOpenModal(false),
        )}
        open={openModal}
      >
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
                    onChange={(event) =>
                      setDeleteMetadata(event.target.checked)
                    }
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
                    onChange={(event) =>
                      setDeleteAdminConfig(event.target.checked)
                    }
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
              onChange={(event) => setConfirmText(event.target.value)}
            />
          </Grid>
          <Grid container spacing={3}>
            <Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenModal(false)}
              >
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
      <Dialog
        open={!!job}
        onClose={MuiComponentHelper.getDialogClosingHandler(() => {
          if (!jobInProgress) closeJobDialog();
        })}
      >
        {job && (
          <Fragment>
            <DialogTitle>{jobDialogTitle(job.status)}</DialogTitle>
            <DialogContent>
              {jobInProgress && <CircularProgress size={40} />}
              <DialogContentText>{jobDialogContent(job)}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                disabled={jobInProgress}
                onClick={closeJobDialog}
              >
                OK
              </Button>
            </DialogActions>
          </Fragment>
        )}
      </Dialog>
      <AlertModal
        message={message}
        setShowAlert={setShowAlert}
        showAlert={showAlert}
      />
    </Fragment>
  );
};
