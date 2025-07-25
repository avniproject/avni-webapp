import { useState, useEffect, Fragment } from "react";
import { isEmpty } from "lodash";
import {
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
  Snackbar,
  FormControl
} from "@mui/material";
import { ToolTipContainer } from "./ToolTipContainer";
import { AddAPhoto, Close } from "@mui/icons-material";
import MediaService from "../../adminApp/service/MediaService";

export const ImagePreview = ({ iconPreview, width, height, onDelete }) => {
  const [openPreview, setOpenPreview] = useState(false);

  return (
    <div
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <img
        src={iconPreview}
        alt={"Preview"}
        width={width}
        height={height}
        style={{ cursor: "pointer" }}
        onClick={() => setOpenPreview(true)}
      />
      {onDelete && (
        <IconButton
          color="secondary"
          aria-label="remove image"
          onClick={onDelete}
          size="small"
          style={{ marginLeft: 4 }}
        >
          <Close />
        </IconButton>
      )}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
      >
        <DialogContent
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0
          }}
        >
          <img
            src={iconPreview}
            alt={"Full Preview"}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "block"
            }}
            onClick={() => setOpenPreview(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const AvniImageUpload = ({
  toolTipKey,
  label,
  onSelect,
  onDelete = () => {},
  width = 80,
  height = 80,
  oldImgUrl,
  allowUpload = true,
  maxFileSize,
  uniqueName = "0"
}) => {
  const [, setValue] = useState("");
  const [file, setFile] = useState();
  const [iconPreview, setIconPreview] = useState();
  const [fileSizeError, setFileSizeError] = useState("");

  useEffect(() => {
    if (!file) {
      setIconPreview();
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setIconPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!isEmpty(oldImgUrl)) {
      MediaService.getMedia(oldImgUrl).then(res => {
        setIconPreview(res);
      });
    }
  }, [oldImgUrl]);

  const handleFileChange = event => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (maxFileSize && selectedFile.size > maxFileSize) {
        setFileSizeError(
          `File size ${Math.round(
            (selectedFile.size / 1024 + Number.EPSILON) * 10
          ) / 10} KB exceeds the maximum allowed size of ${Math.round(
            (maxFileSize / 1024 + Number.EPSILON) * 10
          ) / 10} KB.`
        );
        setFile(undefined);
        setValue("");
        return;
      } else {
        setFileSizeError("");
      }
      setFile(selectedFile);
      setValue(selectedFile.name);
      if (onSelect) {
        onSelect(selectedFile);
      }
    }
  };

  const deleteIcon = () => {
    setFile(null);
    onDelete();
  };

  function UploadImage() {
    return (
      <Fragment>
        <FormControl>
          <Grid
            container
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center"
            }}
          >
            <Grid>
              <Typography sx={{ opacity: 0.5 }}>{label}</Typography>
            </Grid>
            {allowUpload && (
              <Grid>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id={`icon-button-file-${uniqueName}`}
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor={`icon-button-file-${uniqueName}`}>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    size="large"
                  >
                    <AddAPhoto />
                  </IconButton>
                </label>
              </Grid>
            )}
            {iconPreview && (
              <Grid>
                <ImagePreview
                  iconPreview={iconPreview}
                  width={width}
                  height={height}
                  onDelete={deleteIcon}
                />
              </Grid>
            )}
          </Grid>
        </FormControl>
        <Snackbar
          open={Boolean(fileSizeError)}
          autoHideDuration={6000}
          onClose={() => setFileSizeError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 4,
              padding: 12,
              boxShadow: "0px 2px 8px rgba(0,0,0,0.2)"
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: theme => theme.palette.error.main }}
            >
              {fileSizeError}
            </Typography>
          </div>
        </Snackbar>
      </Fragment>
    );
  }

  function UploadImageWithTooltip({ toolTipKey }) {
    return (
      <ToolTipContainer toolTipKey={toolTipKey}>
        <UploadImage />
      </ToolTipContainer>
    );
  }

  return isEmpty(toolTipKey) ? (
    <UploadImage />
  ) : (
    <UploadImageWithTooltip toolTipKey={toolTipKey} />
  );
};
