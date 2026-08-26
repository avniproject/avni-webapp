import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isNil } from "lodash";
import {
  Box,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  LinearProgress,
} from "@mui/material";
import { Title } from "react-admin";
import { AvniTextField } from "../../common/components/AvniTextField";
import { AvniSelect } from "../../common/components/AvniSelect";
import { SaveComponent } from "../../common/components/SaveComponent";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import { getErrorByKey } from "../../formDesigner/common/ErrorUtil";
import DownloadableContentService, {
  Category,
  GuidanceKind,
  GUIDANCE_KIND_LABELS,
  blobExtensionFor,
  buildContentRequest,
  computeFileSha256,
  extensionOf,
  isUnencryptedCategory,
  parsePayload,
  performSave,
  validateContent,
} from "./DownloadableContentService";

const LIST_ROUTE = "/appDesigner/downloadableContent";

const emptyState = {
  uuid: null,
  name: "",
  category: Category.edgeModel,
  sha256: "",
  needsKey: true,
  payloadText: "",
  blobExtension: "bin",
};

// The thrown SaveStepError names the failing step; its cause carries the HTTP
// status / server message, which is what makes a failed blob upload diagnosable
// (413 too large, 403, missing MODEL backend, etc).
const buildSaveErrorMessage = (error) => {
  const base = error.message || "Save failed";
  const cause = error.cause;
  if (!cause) return base;
  const status = cause.response?.status;
  const data = cause.response?.data;
  const detail =
    (typeof data === "string" ? data : data?.message || data?.error) ||
    cause.message;
  const shortDetail = typeof detail === "string" ? detail.slice(0, 200) : "";
  const parts = [base];
  if (status) parts.push(`(HTTP ${status})`);
  if (shortDetail) parts.push(`- ${shortDetail}`);
  return parts.join(" ");
};

const CreateEditDownloadableContent = () => {
  const params = useParams();
  const navigate = useNavigate();
  const editing = !isNil(params.uuid);

  const [content, setContent] = useState(emptyState);
  const [originalSha256, setOriginalSha256] = useState(null);
  const [aesKey, setAesKey] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [existingContents, setExistingContents] = useState(null);
  const [hashError, setHashError] = useState(null);

  const guidance = isUnencryptedCategory(content.category);

  // Only for the duplicate position+type check; a failed fetch skips it rather than blocking.
  useEffect(() => {
    DownloadableContentService.getAll()
      .then(setExistingContents)
      .catch(() => setExistingContents(null));
  }, []);

  useEffect(() => {
    if (!editing) return;
    DownloadableContentService.getByUuid(params.uuid).then((record) => {
      setContent({
        uuid: record.uuid,
        name: record.name || "",
        category: record.category || Category.edgeModel,
        sha256: record.sha256 || "",
        needsKey: !!record.needsKey,
        payloadText: JSON.stringify(record.payload || {}, null, 2),
        // From the stored key, so editing without re-choosing rebuilds the same key.
        blobExtension: extensionOf(record.contentKey) || "bin",
      });
      setOriginalSha256(record.sha256 || "");
    });
  }, [editing, params.uuid]);

  const update = (patch) => setContent((prev) => ({ ...prev, ...patch }));

  const guidancePayload = () => {
    const [parsed] = parsePayload(content.payloadText);
    return parsed || {};
  };

  const updateGuidance = (patch) =>
    update({
      payloadText: JSON.stringify({ ...guidancePayload(), ...patch }, null, 2),
    });

  // Different fields apply per category, so start clean rather than carrying one into the other.
  const onCategoryChange = (category) => {
    setFile(null);
    setAesKey("");
    setHashError(null);
    update({
      category,
      needsKey: !isUnencryptedCategory(category),
      sha256: "",
      payloadText: "",
      blobExtension: blobExtensionFor(category, ""),
    });
  };

  const onFileSelected = async (selected) => {
    setFile(selected);
    setHashError(null);
    if (!selected) return;
    update({
      blobExtension: blobExtensionFor(content.category, selected.name),
    });
    if (!guidance) return;
    try {
      update({ sha256: await computeFileSha256(selected) });
    } catch (error) {
      setHashError(error.message);
    }
  };

  const onSave = async () => {
    if (saving) return;

    const validationErrors = validateContent(content, {
      editing,
      hasFile: !!file,
      hasKey: aesKey.trim() !== "",
      originalSha256,
      existingContents,
    });
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    const [payload] = parsePayload(content.payloadText);
    const request = buildContentRequest({ ...content, payload });

    setSaving(true);
    setSaveError(null);
    setUploadProgress(null);
    try {
      await performSave({
        request,
        sha256: content.sha256,
        file,
        key: aesKey,
        needsKey: content.needsKey,
        service: DownloadableContentService,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            );
          }
        },
      });
      navigate(LIST_ROUTE);
    } catch (error) {
      setSaveError(buildSaveErrorMessage(error));
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  return (
    <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
      <Title title="Downloadable Content" />
      <Grid container direction="column" spacing={3} sx={{ maxWidth: 600 }}>
        <Grid>
          <AvniTextField
            id="name"
            label="Name*"
            value={content.name}
            autoComplete="off"
            onChange={(e) => update({ name: e.target.value })}
            fullWidth
          />
          {getErrorByKey(errors, "EMPTY_NAME")}
        </Grid>
        <Grid>
          <AvniSelect
            label="Category"
            value={content.category}
            options={Object.values(Category).map((c) => ({
              value: c,
              label: c,
            }))}
            onChange={(e) => onCategoryChange(e.target.value)}
          />
        </Grid>
        <Grid>
          <AvniTextField
            id="sha256"
            label={
              guidance
                ? "SHA-256 (computed from the file)"
                : "SHA-256 (plaintext hash)*"
            }
            value={content.sha256}
            autoComplete="off"
            onChange={(e) => update({ sha256: e.target.value.trim() })}
            disabled={guidance}
            helperText={
              guidance
                ? "Worked out from the image you choose below, so it can never be typed in wrongly."
                : undefined
            }
            fullWidth
          />
          {getErrorByKey(errors, "INVALID_SHA256")}
          {hashError && (
            <Typography variant="caption" color="error" display="block">
              {hashError}
            </Typography>
          )}
        </Grid>
        <Grid>
          {guidance ? (
            <Grid container direction="column" spacing={2}>
              <Typography variant="subtitle2">Guidance details</Typography>
              <Grid>
                <AvniTextField
                  id="site"
                  label="Site name*"
                  value={guidancePayload().site || ""}
                  autoComplete="off"
                  onChange={(e) => updateGuidance({ site: e.target.value })}
                  helperText="Shown to the health worker, e.g. Left buccal mucosa."
                  fullWidth
                />
              </Grid>
              <Grid>
                <AvniTextField
                  id="sequence"
                  label="Position*"
                  type="number"
                  value={guidancePayload().sequence ?? ""}
                  autoComplete="off"
                  onChange={(e) =>
                    updateGuidance({
                      sequence:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  helperText="Which photo in the protocol this picture guides."
                  fullWidth
                />
              </Grid>
              <Grid>
                <AvniSelect
                  label="Picture type*"
                  value={guidancePayload().kind || ""}
                  options={Object.values(GuidanceKind).map((kind) => ({
                    value: kind,
                    label: GUIDANCE_KIND_LABELS[kind],
                  }))}
                  onChange={(e) => updateGuidance({ kind: e.target.value })}
                />
              </Grid>
            </Grid>
          ) : (
            <AvniTextField
              id="payload"
              label="Payload (JSON)"
              value={content.payloadText}
              autoComplete="off"
              multiline
              minRows={6}
              onChange={(e) => update({ payloadText: e.target.value })}
              fullWidth
              placeholder={
                '{\n  "engine": "onnx",\n  "input": {},\n  "output": {}\n}'
              }
            />
          )}
          {getErrorByKey(errors, "INVALID_PAYLOAD")}
          {getErrorByKey(errors, "INVALID_PAYLOAD_SHAPE")}
          {getErrorByKey(errors, "DUPLICATE_GUIDANCE")}
        </Grid>
        {!guidance && (
          <Grid>
            <FormControlLabel
              control={
                <Checkbox
                  checked={content.needsKey}
                  onChange={(e) => {
                    update({ needsKey: e.target.checked });
                    if (!e.target.checked) setAesKey("");
                  }}
                />
              }
              label="Needs decryption key"
            />
          </Grid>
        )}
        <Grid>
          <Typography variant="subtitle2">
            {guidance ? "Image file (.png / .jpg)" : "Encrypted blob (.bin)"}
          </Typography>
          <input
            type="file"
            accept={guidance ? ".png,.jpg,.jpeg" : ".bin"}
            onChange={(e) => onFileSelected(e.target.files[0] || null)}
          />
          {file && (
            <Typography variant="caption" display="block">
              {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB
            </Typography>
          )}
          {getErrorByKey(errors, "MISSING_BLOB")}
          {getErrorByKey(errors, "INVALID_IMAGE_TYPE")}
        </Grid>
        {!guidance && (
          <Grid>
            <Typography variant="subtitle2">AES key (write-only)</Typography>
            <AvniTextField
              id="aesKey"
              label="AES key"
              type="password"
              value={aesKey}
              autoComplete="new-password"
              onChange={(e) => setAesKey(e.target.value)}
              placeholder={editing ? "Enter to replace stored key" : ""}
              disabled={!content.needsKey}
              fullWidth
            />
            <Typography variant="caption" color="textSecondary">
              The key is sent only to the server key store and never stored on
              this record or returned to the browser.
            </Typography>
            {getErrorByKey(errors, "MISSING_KEY")}
          </Grid>
        )}
        <Grid>
          <SaveComponent name="Save" onSubmit={onSave} disabledFlag={saving} />
          <Button
            sx={{ ml: 2 }}
            disabled={saving}
            onClick={() => navigate(LIST_ROUTE)}
          >
            Cancel
          </Button>
          {saving && uploadProgress != null && (
            <Box sx={{ mt: 1, maxWidth: 300 }}>
              <Typography variant="caption" display="block">
                Uploading blob… {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Grid>
      </Grid>
      {saveError && (
        <CustomizedSnackbar
          message={saveError}
          getDefaultSnackbarStatus={() => setSaveError(null)}
          defaultSnackbarStatus={true}
          autoHideDuration={4000}
          variant="error"
        />
      )}
    </Box>
  );
};

export default CreateEditDownloadableContent;
