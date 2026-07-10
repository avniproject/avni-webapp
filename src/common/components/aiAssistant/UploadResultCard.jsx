import { Alert, Box, Link } from "@mui/material";

const IMPORT_STATUS_PATH = "#/admin/upload";

/**
 * Inline message rendering one `upload.done` event. Per
 * specs/INLINE_AUTOPILOT_CARDS_SDD.md §5.2 the upload outcome is its own
 * chronological entry so re-uploads in the same session each leave their
 * own record in scrollback.
 *
 * Props:
 *  - msg: { type: "upload", status: "ok"|"failed", details?, error_log_available?, ts }
 *  - uploadErrorLogUrl: string | null — link target for the error log download
 */
const UploadResultCard = ({ msg, uploadErrorLogUrl }) => {
  if (msg.status === "ok") {
    return (
      <Box sx={{ mb: 1.5 }}>
        <Alert
          severity="success"
          sx={{ borderRadius: 2 }}
          action={
            <Link
              component="a"
              href={IMPORT_STATUS_PATH}
              color="inherit"
              underline="always"
              sx={{ fontWeight: 600 }}
            >
              View status
            </Link>
          }
        >
          All set! Log in to the Avni mobile app and start using it.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <Alert
        severity="error"
        sx={{ borderRadius: 2 }}
        action={
          msg.error_log_available && uploadErrorLogUrl ? (
            <Link
              component="a"
              href={uploadErrorLogUrl}
              download
              color="inherit"
              underline="always"
              sx={{ fontWeight: 600 }}
            >
              Download log
            </Link>
          ) : null
        }
      >
        Upload failed: {msg.details || "unknown error"}
      </Alert>
    </Box>
  );
};

export default UploadResultCard;
