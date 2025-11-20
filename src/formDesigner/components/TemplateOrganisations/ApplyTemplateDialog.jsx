import { useState, useEffect } from "react";
import { httpClient as http } from "../../../common/utils/httpClient";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

export const ApplyTemplateDialog = ({
  open,
  onClose,
  templateId,
  onApplySuccess,
}) => {
  const [applyStatus, setApplyStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog is closed
      setApplyStatus(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const getDialogTitle = (status) => {
    switch (status) {
      case "FAILED":
      case "ABANDONED":
      case "UNKNOWN":
      case "STOPPED":
        return "Error in applying template";
      case "COMPLETED":
        return "Cheers! Your app is ready for use";
      default:
        return "Applying Template!";
    }
  };

  const getDialogContent = (status) => {
    switch (status) {
      case "FAILED":
      case "ABANDONED":
      case "UNKNOWN":
      case "STOPPED":
        return "Your template could not be applied. Please try again after some time.";
      case "COMPLETED":
        return (
          <span>
            Your template has been applied successfully. You can{" "}
            <a
              href="https://play.google.com/store/apps/details?id=com.openchsclient"
              target="_blank"
              rel="noopener noreferrer"
            >
              download Avni App
            </a>{" "}
            to test it out or try this on our{" "}
            <a href="#/app" target="_blank" rel="noopener noreferrer">
              Data Entry Web App
            </a>
          </span>
        );
      default:
        return "Please wait while we build this program template for you. It will take a few mins.";
    }
  };

  const isTerminalStatus = (status) => {
    switch (status) {
      case "FAILED":
      case "ABANDONED":
      case "UNKNOWN":
      case "STOPPED":
      case "COMPLETED":
        return true;
      default:
        return false;
    }
  };

  const pollApplyJobStatus = (pollInterval) => {
    const intervalId = setInterval(() => {
      http
        .get("/web/templateOrganisations/apply/status")
        .then((response) => {
          const { applyTemplateJob } = response.data;
          setApplyStatus(applyTemplateJob.status);
          if (
            applyTemplateJob?.endDateTime ||
            isTerminalStatus(applyTemplateJob.status)
          ) {
            clearInterval(intervalId);
            setIsSubmitting(false);
            if (applyTemplateJob.status === "COMPLETED" && onApplySuccess) {
              onApplySuccess();
            }
          }
        })
        .catch((error) => {
          console.error("Error polling job status:", error);
          clearInterval(intervalId);
          setApplyStatus("POLL_ERROR");
          setIsSubmitting(false);
        });
    }, 3000);

    return intervalId;
  };

  const handleApply = () => {
    if (!templateId) return;

    setIsSubmitting(true);
    setApplyStatus("JOB_REQUESTED");

    http
      .post(`/web/templateOrganisations/${templateId}/apply`)
      .then(() => {
        setApplyStatus("JOB_CREATED");
        const intervalId = pollApplyJobStatus();
        return () => clearInterval(intervalId);
      })
      .catch((err) => {
        console.error(err);
        setApplyStatus("FAILED");
        setIsSubmitting(false);
      });
  };

  const handleClose = () => {
    if (isSubmitting && !isTerminalStatus(applyStatus)) return;
    onClose();
  };

  const isConfirmDialog = !applyStatus;
  const isInProgress = applyStatus && !isTerminalStatus(applyStatus);
  const isComplete = applyStatus && isTerminalStatus(applyStatus);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          if (isTerminalStatus(applyStatus)) {
            handleClose();
          }
          return;
        }
        handleClose();
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          minHeight: "300px",
          maxWidth: "500px",
          width: "100%",
          margin: "16px",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {applyStatus ? (
        <>
          <DialogTitle id="alert-dialog-title">
            {getDialogTitle(applyStatus)}
          </DialogTitle>
          <DialogContent
            sx={{
              flex: "1 1 auto",
              py: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {isInProgress && <CircularProgress size={50} sx={{ mb: 3 }} />}
            <Typography
              variant="body1"
              sx={{
                maxWidth: "80%",
                whiteSpace: "pre-line",
              }}
            >
              {getDialogContent(applyStatus)}
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 2,
              pt: 1,
              justifyContent: "flex-end",
              "& > :not(:first-of-type)": {
                ml: 2,
              },
            }}
          >
            <Button
              onClick={handleClose}
              disabled={!isTerminalStatus(applyStatus)}
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              OK
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle id="alert-dialog-title">
            Are you sure you want to apply this template?
          </DialogTitle>
          <DialogContent sx={{ flex: "1 1 auto", py: 2 }}>
            <Typography>
              Once applied, you cannot revert this change but you can customize
              it according to your needs.
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 2,
              pt: 1,
              justifyContent: "flex-end",
              "& > :not(:first-of-type)": {
                ml: 2,
              },
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ minWidth: 100 }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              color="primary"
              sx={{ minWidth: 100 }}
              autoFocus
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Apply"
              )}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ApplyTemplateDialog;
