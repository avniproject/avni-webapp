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
} from "@mui/material";
import { Title } from "react-admin";
import { AvniTextField } from "../../common/components/AvniTextField";
import { AvniSelect } from "../../common/components/AvniSelect";
import { SaveComponent } from "../../common/components/SaveComponent";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import { getErrorByKey } from "../../formDesigner/common/ErrorUtil";
import DownloadableContentService, {
  Category,
  buildContentRequest,
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
      });
      setOriginalSha256(record.sha256 || "");
    });
  }, [editing, params.uuid]);

  const update = (patch) => setContent((prev) => ({ ...prev, ...patch }));

  const onSave = async () => {
    if (saving) return;

    const validationErrors = validateContent(content, {
      editing,
      hasFile: !!file,
      hasKey: aesKey.trim() !== "",
      originalSha256,
    });
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    const [payload] = parsePayload(content.payloadText);
    const request = buildContentRequest({ ...content, payload });

    setSaving(true);
    setSaveError(null);
    try {
      await performSave({
        request,
        sha256: content.sha256,
        file,
        key: aesKey,
        service: DownloadableContentService,
      });
      navigate(LIST_ROUTE);
    } catch (error) {
      setSaveError(error.message || "Save failed");
    } finally {
      setSaving(false);
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
            onChange={(e) => update({ category: e.target.value })}
          />
        </Grid>
        <Grid>
          <AvniTextField
            id="sha256"
            label="SHA-256 (plaintext hash)*"
            value={content.sha256}
            autoComplete="off"
            onChange={(e) => update({ sha256: e.target.value.trim() })}
            fullWidth
          />
          {getErrorByKey(errors, "INVALID_SHA256")}
        </Grid>
        <Grid>
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
          {getErrorByKey(errors, "INVALID_PAYLOAD")}
        </Grid>
        <Grid>
          <FormControlLabel
            control={
              <Checkbox
                checked={content.needsKey}
                onChange={(e) => update({ needsKey: e.target.checked })}
              />
            }
            label="Needs decryption key"
          />
        </Grid>
        <Grid>
          <Typography variant="subtitle2">Encrypted blob (.bin)</Typography>
          <input
            type="file"
            accept=".bin"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          {file && (
            <Typography variant="caption" display="block">
              {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB
            </Typography>
          )}
          {getErrorByKey(errors, "MISSING_BLOB")}
        </Grid>
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
            fullWidth
          />
          <Typography variant="caption" color="textSecondary">
            The key is sent only to the server key store and never stored on
            this record or returned to the browser.
          </Typography>
          {getErrorByKey(errors, "MISSING_KEY")}
        </Grid>
        <Grid>
          <SaveComponent name="Save" onSubmit={onSave} disabledFlag={saving} />
          <Button
            sx={{ ml: 2 }}
            disabled={saving}
            onClick={() => navigate(LIST_ROUTE)}
          >
            Cancel
          </Button>
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
