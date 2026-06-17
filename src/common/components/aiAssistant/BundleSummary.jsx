import { useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { CloudUpload, Download, CheckCircle } from "@mui/icons-material";

/**
 * Inline message rendering one `bundle.ready` event: summary counts +
 * Upload-to-org + Download. Per specs/INLINE_AUTOPILOT_CARDS_SDD.md §5.2
 * the success / failure alerts that previously lived here move out to
 * `UploadResultCard` so each upload outcome has its own message in chat.
 *
 * Props:
 *  - msg: { type: "bundle", path, summary: {programs, encounter_types, main_forms, ...}, uploaded: boolean }
 *  - downloadBundleUrl: string
 *  - onUploadToAvni: () => Promise
 *
 * Counts shown: programs, visit types, forms only. Subjects, cancellation
 * forms, concepts, and form_mappings are kept out of view as either
 * internal plumbing or noisy for non-Avni audiences.
 */
const BundleSummary = ({ msg, downloadBundleUrl, onUploadToAvni }) => {
  const [uploading, setUploading] = useState(false);
  const summary = msg.summary || {};

  const counts = [
    ["Programs", summary.programs],
    ["Visit types", summary.encounter_types],
    ["Forms", summary.main_forms],
  ].filter(([, v]) => typeof v === "number");

  // Surfaces caveats the agent's narration used to carry — now hidden by
  // the post-card message suppression in `useChatSession.js`. Pull them
  // straight from the bundle.ready payload so users still see them.
  const warnings = [
    ...(summary.parse_warnings || []),
    ...(summary.enrich_warnings || []),
  ];
  const errors = summary.errors || [];

  const upload = async () => {
    setUploading(true);
    await onUploadToAvni();
    setUploading(false);
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 1.5,
        background: "linear-gradient(180deg, #e8f5e9 0%, #d6efd9 100%)",
        border: "1px solid",
        borderColor: "success.main",
        borderRadius: 2,
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

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 1.25, borderRadius: 2 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>
            {errors.length} error{errors.length === 1 ? "" : "s"}
          </AlertTitle>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {errors.map((e, i) => (
              <li key={i}>
                <Typography variant="body2">{e}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 1.25, borderRadius: 2 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>
            {warnings.length} warning{warnings.length === 1 ? "" : "s"}
          </AlertTitle>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {warnings.map((w, i) => (
              <li key={i}>
                <Typography variant="body2">{w}</Typography>
              </li>
            ))}
          </Box>
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
          disabled={uploading || msg.uploaded}
          fullWidth
          sx={{
            py: 1.1,
            borderRadius: 2,
            fontWeight: 600,
            letterSpacing: 0.3,
            boxShadow: 2,
          }}
        >
          {msg.uploaded ? "Uploaded" : "Upload to org"}
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
