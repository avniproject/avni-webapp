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
import { CloudUpload, Download, CheckCircle } from "@mui/icons-material";

const IMPORT_STATUS_PATH = "#/admin/upload";

/**
 * Post-`bundle.ready` view — counts + Upload to org / Download.
 *
 * Props:
 *  - bundle: { path, summary: {programs, encounter_types, main_forms, ...} }
 *  - uploadResult: { job_id, status: "ok"|"failed", details? } | null
 *  - downloadBundleUrl: string
 *  - onUploadToAvni: () => Promise
 *
 * Counts shown to the user: programs, visit types, forms only. Subjects,
 * cancellation forms, concepts, and form_mappings are kept out of view —
 * they are either internal plumbing or noisy for non-Avni audiences.
 */
const BundleSummary = ({
  bundle,
  uploadResult,
  downloadBundleUrl,
  uploadErrorLogUrl,
  onUploadToAvni,
}) => {
  const [uploading, setUploading] = useState(false);
  const summary = bundle.summary || {};

  const counts = [
    ["Programs", summary.programs],
    ["Visit types", summary.encounter_types],
    ["Forms", summary.main_forms],
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
          Your app is ready
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
            <Link
              component="a"
              href={IMPORT_STATUS_PATH}
              color="inherit"
              underline="always"
              sx={{ fontWeight: 600 }}
            >
              View import status
            </Link>
          }
        >
          All set! Log in to the Avni mobile app and start using it.
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
