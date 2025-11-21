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
import PropTypes from "prop-types";

export const TEMPLATE_APPLY_PROGRESS_KEY = "template-apply-in-progress";

export const MAX_POLLING_TIME = 300000; // 5 minutes in milliseconds

export const MAX_RETRY_ATTEMPTS = 3;

export const RETRY_BASE_DELAY = 1000; // 1 second

export const POLLING_INTERVAL = 3000; // 3 seconds

export const DIALOG_CONFIG = {
  maxWidth: "sm",
  fullWidth: true,
  minHeight: "300px",
  dialogMaxWidth: "500px",
  margin: "16px",
};

export const PROGRESS_SIZE = {
  dialog: 50,
  button: 24,
};

export const TYPOGRAPHY_CONFIG = {
  maxWidth: "80%",
};

export const BUTTON_CONFIG = {
  minWidth: 100,
  applyMinWidth: 180,
};

export const isTerminalStatus = (status) => {
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

export const ApplyTemplateDialog = ({
  open,
  onClose,
  templateId,
  onApplySuccess,
}) => {
  const [applyStatus, setApplyStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog is closed
      setApplyStatus(null);
      setIsSubmitting(false);
      setRetryCount(0);
      // Clear any running intervals
      setIntervalId((currentIntervalId) => {
        if (currentIntervalId) {
          clearInterval(currentIntervalId);
        }
        return null;
      });
    }
  }, [open]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
      }
    };
  }, [intervalId]);

  const getDialogTitle = (status) => {
    switch (status) {
      case "TIMEOUT":
        return "Template Application Timed Out";
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
      case "TIMEOUT":
        return "Template application timed out. Please try again.";
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

  const pollApplyJobStatus = () => {
    const startTime = Date.now();

    const newIntervalId = setInterval(() => {
      // Check for timeout
      if (Date.now() - startTime > MAX_POLLING_TIME) {
        clearInterval(newIntervalId);
        setApplyStatus("TIMEOUT");
        setIsSubmitting(false);
        localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
        return;
      }

      http
        .get("/web/templateOrganisations/apply/status")
        .then((response) => {
          const { applyTemplateJob } = response.data;
          setApplyStatus(applyTemplateJob.status);
          setRetryCount(0); // Reset retry count on successful request
          if (
            applyTemplateJob?.endDateTime ||
            isTerminalStatus(applyTemplateJob.status)
          ) {
            clearInterval(newIntervalId);
            setIsSubmitting(false);
            localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
            if (applyTemplateJob.status === "COMPLETED" && onApplySuccess) {
              onApplySuccess();
            }
          }
        })
        .catch((error) => {
          console.error("Error polling job status:", error);

          // Check if we should retry
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            const delay = RETRY_BASE_DELAY * Math.pow(2, retryCount);
            console.log(
              `Retrying poll attempt ${retryCount + 1} after ${delay}ms`,
            );

            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, delay);
          } else {
            // Max retries reached, give up
            clearInterval(newIntervalId);
            setApplyStatus("POLL_ERROR");
            setIsSubmitting(false);
            localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
            setRetryCount(0);
          }
        });
    }, POLLING_INTERVAL);

    return newIntervalId;
  };

  const handleApply = () => {
    if (!templateId) return;

    setIsSubmitting(true);
    setApplyStatus("JOB_REQUESTED");
    localStorage.setItem(TEMPLATE_APPLY_PROGRESS_KEY, "true");

    http
      .post(`/web/templateOrganisations/${templateId}/apply`)
      .then(() => {
        setApplyStatus("JOB_CREATED");
        const newIntervalId = pollApplyJobStatus();
        setIntervalId(newIntervalId);
      })
      .catch((err) => {
        console.error(err);
        setApplyStatus("FAILED");
        setIsSubmitting(false);
        localStorage.removeItem(TEMPLATE_APPLY_PROGRESS_KEY);
      });
  };

  const handleClose = () => {
    if (isSubmitting && !isTerminalStatus(applyStatus)) return;
    onClose();
  };

  const isInProgress = applyStatus && !isTerminalStatus(applyStatus);

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
      role="dialog"
      aria-modal="true"
      maxWidth={DIALOG_CONFIG.maxWidth}
      fullWidth={DIALOG_CONFIG.fullWidth}
      PaperProps={{
        style: {
          minHeight: DIALOG_CONFIG.minHeight,
          maxWidth: DIALOG_CONFIG.dialogMaxWidth,
          width: "100%",
          margin: DIALOG_CONFIG.margin,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {applyStatus ? (
        <>
          <DialogTitle id="alert-dialog-title">
            <Typography variant="h6" component="h2">
              {getDialogTitle(applyStatus)}
            </Typography>
          </DialogTitle>
          <DialogContent
            id="alert-dialog-description"
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
            {isInProgress && (
              <Box sx={{ mb: 3 }} role="status" aria-live="polite">
                <CircularProgress size={PROGRESS_SIZE.dialog} />
                <Typography
                  variant="srOnly"
                  sx={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                  }}
                >
                  Loading template application status
                </Typography>
              </Box>
            )}
            <Typography
              variant="body1"
              sx={{
                maxWidth: TYPOGRAPHY_CONFIG.maxWidth,
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
              sx={{ minWidth: BUTTON_CONFIG.minWidth }}
            >
              OK
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle id="alert-dialog-title">
            <Typography variant="h6" component="h2">
              Are you sure you want to apply this template?
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ flex: "1 1 auto", py: 2 }}>
            <Typography id="alert-dialog-description">
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
              sx={{ minWidth: BUTTON_CONFIG.minWidth }}
              disabled={isSubmitting}
              aria-describedby="alert-dialog-description"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              color="primary"
              sx={{ minWidth: BUTTON_CONFIG.minWidth }}
              autoFocus
              disabled={isSubmitting}
              aria-describedby="alert-dialog-description"
            >
              {isSubmitting ? (
                <CircularProgress size={PROGRESS_SIZE.button} color="inherit" />
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

ApplyTemplateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  templateId: PropTypes.string.isRequired,
  onApplySuccess: PropTypes.func,
};

ApplyTemplateDialog.defaultProps = {
  onApplySuccess: () => {},
};

export default ApplyTemplateDialog;
