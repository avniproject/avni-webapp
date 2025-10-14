import { useState, useEffect, Fragment } from "react";
import { isEmpty, toLower } from "lodash";
import {
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
  Snackbar,
  FormControl,
} from "@mui/material";
import { ToolTipContainer } from "./ToolTipContainer";
import { AddAPhoto, VideoCall, Close } from "@mui/icons-material";
import MediaService from "../../adminApp/service/MediaService";

const MEDIA_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
};

const getMediaType = (file) => {
  if (!file) return null;
  return file.type.startsWith("video/") ? MEDIA_TYPES.VIDEO : MEDIA_TYPES.IMAGE;
};

export const MediaPreview = ({
  mediaUrl,
  mediaType,
  width,
  height,
  onDelete,
}) => {
  console.log("MediaPreview", mediaType, mediaUrl);
  const [openPreview, setOpenPreview] = useState(false);
  const isVideo = toLower(mediaType) === toLower(MEDIA_TYPES.VIDEO);

  const renderMediaPreview = (url, type) => {
    if (toLower(type) === toLower(MEDIA_TYPES.VIDEO)) {
      return (
        <video
          width={width}
          height={height}
          style={{ cursor: "pointer", objectFit: "cover" }}
          onClick={() => setOpenPreview(true)}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <img
        src={url}
        alt={"Preview"}
        width={width}
        height={height}
        style={{ cursor: "pointer", objectFit: "cover" }}
        onClick={() => setOpenPreview(true)}
      />
    );
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      {renderMediaPreview(mediaUrl, mediaType)}
      {onDelete && (
        <IconButton
          color="secondary"
          aria-label={`remove ${mediaType}`}
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
            padding: 0,
            backgroundColor: "#000",
          }}
        >
          {isVideo ? (
            <video
              controls
              autoPlay
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                display: "block",
              }}
            >
              <source src={mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt={"Full Preview"}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                display: "block",
              }}
              onClick={() => setOpenPreview(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const AvniMediaUpload = ({
  toolTipKey,
  label,
  onSelect,
  onDelete = () => {},
  width = 80,
  height = 80,
  oldImgUrl,
  allowUpload = true,
  maxFileSize,
  uniqueName = "0",
  localMediaUrl,
  accept = "*/*",
}) => {
  const [value, setValue] = useState("");
  const [file, setFile] = useState();
  const [mediaPreview, setMediaPreview] = useState();
  const [mediaType, setMediaType] = useState(null);
  const [fileSizeError, setFileSizeError] = useState("");

  useEffect(() => {
    if (!file) {
      setMediaPreview();
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setMediaPreview(objectUrl);
    setMediaType(getMediaType(file));

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!isEmpty(oldImgUrl)) {
      MediaService.getMedia(oldImgUrl).then((res) => {
        setMediaPreview(res);
        // Try to determine media type from URL extension if possible
        const isVideo = oldImgUrl.toLowerCase().match(/\.(mp4|webm|ogg)$/i);
        setMediaType(isVideo ? MEDIA_TYPES.VIDEO : MEDIA_TYPES.IMAGE);
      });
    } else if (!isEmpty(localMediaUrl)) {
      setMediaPreview(localMediaUrl);
      const isVideo = localMediaUrl.toLowerCase().match(/\.(mp4|webm|ogg)$/i);
      setMediaType(isVideo ? MEDIA_TYPES.VIDEO : MEDIA_TYPES.IMAGE);
    } else {
      setMediaPreview();
      setMediaType(null);
    }
  }, [oldImgUrl, localMediaUrl]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (maxFileSize && selectedFile.size > maxFileSize) {
        setFileSizeError(
          `File size ${
            Math.round((selectedFile.size / 1024 + Number.EPSILON) * 10) / 10
          } KB exceeds the maximum allowed size of ${
            Math.round((maxFileSize / 1024 + Number.EPSILON) * 10) / 10
          } KB.`,
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

  const renderUploadButton = () => {
    return (
      <Fragment>
        <input
          accept={accept}
          style={{ display: "none" }}
          id={`media-button-file-${uniqueName}`}
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor={`media-button-file-${uniqueName}`}>
          <IconButton
            color="primary"
            aria-label="upload media"
            component="span"
            style={{ width, height, border: "1px dashed #ccc" }}
          >
            {accept.includes("video") ? <VideoCall /> : <AddAPhoto />}
          </IconButton>
        </label>
      </Fragment>
    );
  };

  return (
    <Fragment>
      <FormControl>
        <Grid
          container
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <Grid>
            <Typography sx={{ opacity: 0.5 }}>{label}</Typography>
          </Grid>
          {allowUpload && <Grid>{renderUploadButton()}</Grid>}
          {mediaPreview && mediaType && (
            <Grid>
              <ToolTipContainer toolTipKey={toolTipKey} toolTipText={label}>
                <MediaPreview
                  mediaUrl={mediaPreview}
                  mediaType={mediaType}
                  width={width}
                  height={height}
                  onDelete={deleteIcon}
                />
              </ToolTipContainer>
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
            boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <Typography variant="body2" sx={{ color: "error.main" }}>
            {fileSizeError}
          </Typography>
        </div>
      </Snackbar>
    </Fragment>
  );
};
