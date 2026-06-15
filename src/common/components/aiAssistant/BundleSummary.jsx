import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  CloudUpload,
  Download,
  CheckCircle,
  Description,
} from "@mui/icons-material";
import { httpClient as http } from "common/utils/httpClient";

// httpClient.downloadFile (not a bare fetch) so the IDP-managed auth +
// ORGANISATION-UUID headers go along — without them avni-server 500s.
const downloadImportErrorFile = async (jobUuid) => {
  await http.downloadFile(
    `/import/errorfile?jobUuid=${encodeURIComponent(jobUuid)}`,
    `import-errors-${jobUuid}.csv`,
  );
};

/**
 * Post-`bundle.ready` view — counts + Upload to org / Download.
 *
 * Props:
 *  - bundle: { path, summary: {subject_types, programs, encounter_types, main_forms, concepts, ...} }
 *  - uploadResult: { job_id, status: "ok"|"failed", details? } | null
 *  - downloadBundleUrl: string
 *  - onUploadToAvni: () => Promise
 */
const BundleSummary = ({
  bundle,
  uploadResult,
  downloadBundleUrl,
  uploadErrorLogUrl,
  onUploadToAvni,
}) => {
  const [uploading, setUploading] = useState(false);
  const [errorFileDownloading, setErrorFileDownloading] = useState(false);
  const [errorFileMsg, setErrorFileMsg] = useState(null);
  const summary = bundle.summary || {};

  const onDownloadErrorFile = async () => {
    if (!uploadResult?.job_id) return;
    setErrorFileDownloading(true);
    setErrorFileMsg(null);
    try {
      await downloadImportErrorFile(uploadResult.job_id);
    } catch (err) {
      const status = err?.response?.status || err?.status;
      let msg;
      if (status === 404) {
        msg = "No error file — the import completed without any skipped rows.";
      } else if (status === 500 || status === 503) {
        msg = "The import may still be processing — try again in a moment.";
      } else {
        msg = `Couldn't fetch the error file (${status || err.message}).`;
      }
      setErrorFileMsg(msg);
    } finally {
      setErrorFileDownloading(false);
    }
  };

  const counts = [
    ["Subject types", summary.subject_types],
    ["Programs", summary.programs],
    ["Encounter types", summary.encounter_types],
    ["Forms", summary.main_forms],
    ["Cancellation forms", summary.cancellation_forms],
    ["Concepts", summary.concepts],
  ].filter(([, v]) => typeof v === "number");

  const upload = async () => {
    setUploading(true);
    await onUploadToAvni();
    setUploading(false);
  };

  return (
    <Box
      sx={{
        p: 2,
        background: "linear-gradient(180deg, #e8f5e9 0%, #d6efd9 100%)",
        borderTop: "1px solid",
        borderColor: "success.main",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
        <CheckCircle color="success" />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Bundle ready
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={0.75}
        flexWrap="wrap"
        sx={{ mb: 2, gap: 0.75 }}
      >
        {counts.map(([label, value]) => (
          <Chip
            key={label}
            size="small"
            label={`${label}: ${value}`}
            sx={{
              backgroundColor: "background.paper",
              fontWeight: 500,
              borderRadius: 1.5,
            }}
          />
        ))}
      </Stack>

      {uploadResult?.status === "ok" && (
        <Alert
          severity="success"
          sx={{ mb: 1.25, borderRadius: 2 }}
          action={
            uploadResult.job_id ? (
              <Button
                size="small"
                color="inherit"
                startIcon={
                  errorFileDownloading ? (
                    <CircularProgress size={14} />
                  ) : (
                    <Description fontSize="small" />
                  )
                }
                onClick={onDownloadErrorFile}
                disabled={errorFileDownloading}
                sx={{ fontWeight: 600 }}
              >
                Error file
              </Button>
            ) : null
          }
        >
          Uploaded to {summary.org || "your org"}. Job ID:{" "}
          <code>{uploadResult.job_id}</code>
        </Alert>
      )}
      {errorFileMsg && (
        <Alert
          severity="info"
          sx={{ mb: 1.25, borderRadius: 2 }}
          onClose={() => setErrorFileMsg(null)}
        >
          {errorFileMsg}
        </Alert>
      )}
      {uploadResult?.status === "failed" && (
        <Alert
          severity="error"
          sx={{ mb: 1.25, borderRadius: 2 }}
          action={
            uploadResult.error_log_available && uploadErrorLogUrl ? (
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
          Upload failed: {uploadResult.details || "unknown error"}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            uploading ? <CircularProgress size={16} /> : <CloudUpload />
          }
          onClick={upload}
          disabled={uploading || uploadResult?.status === "ok"}
          fullWidth
          sx={{
            py: 1.1,
            borderRadius: 2,
            fontWeight: 600,
            letterSpacing: 0.3,
            boxShadow: 2,
          }}
        >
          {uploadResult?.status === "ok" ? "Uploaded" : "Upload to org"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          component="a"
          href={downloadBundleUrl}
          download
          sx={{
            py: 1.1,
            px: 2.5,
            borderRadius: 2,
            fontWeight: 600,
            flexShrink: 0,
            minWidth: 130,
          }}
        >
          Download
        </Button>
      </Stack>
    </Box>
  );
};

export default BundleSummary;
