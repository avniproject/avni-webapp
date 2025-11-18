import { useState, useEffect, Fragment } from "react";
import { isEmpty, toLower } from "lodash";
import {
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
  FormControl,
  Stack,
} from "@mui/material";
import { ToolTipContainer } from "./ToolTipContainer";
import { AddAPhoto, VideoCall, Close } from "@mui/icons-material";
import MediaService from "../../adminApp/service/MediaService";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";

const MEDIA_TYPES = {
  IMAGE: "Image",
  VIDEO: "Video",
};

export const MediaPreview = ({
  mediaUrl,
  mediaType,
  width,
  height,
  onDelete,
}) => {
  const [openPreview, setOpenPreview] = useState(false);
  const isVideo = toLower(mediaType) === toLower(MEDIA_TYPES.VIDEO);

  const renderMediaPreview = (url, type) => {
    if (toLower(type) === toLower(MEDIA_TYPES.VIDEO)) {
      return (
        <video
          width={width}
          height={height}
          style={{
            cursor: "pointer",
            objectFit: "cover",
            border: "1px dashed #ccc",
          }}
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
        alt={""}
        width={width}
        height={height}
        style={{
          cursor: "pointer",
          objectFit: "cover",
          border: "1px dashed #ccc",
        }}
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
            padding: "1rem",
            backgroundColor: "#000",
          }}
        >
          {isVideo ? (
            <video
              controls
              autoPlay
              style={{
                width: "100%",
                height: "auto",
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
  mediaType = MEDIA_TYPES.IMAGE,
}) => {
  const [file, setFile] = useState();
  const [mediaPreview, setMediaPreview] = useState();
  const [fileSizeError, setFileSizeError] = useState("");

  useEffect(() => {
    if (!file) {
      setMediaPreview();
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setMediaPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!isEmpty(oldImgUrl)) {
      MediaService.getMedia(oldImgUrl).then((res) => {
        setMediaPreview(res);
      });
    } else if (!isEmpty(localMediaUrl)) {
      setMediaPreview(localMediaUrl);
    } else {
      setMediaPreview();
    }
  }, [oldImgUrl, localMediaUrl]);

  const constructErrorMessage = (mediaType, selectedFileSize, maxFileSize) => {
    const unit = mediaType === "Video" ? "MB" : "KB";
    const friendlySelectedFileSize =
      Math.round(
        (mediaType === "Video"
          ? selectedFileSize / 1024 / 1024
          : selectedFileSize / 1024 + Number.EPSILON) * 10,
      ) / 10;
    const friendlyMaxFileSize =
      Math.round(
        (mediaType === "Video"
          ? maxFileSize / 1024 / 1024
          : maxFileSize / 1024 + Number.EPSILON) * 10,
      ) / 10;
    return `File size ${friendlySelectedFileSize} ${unit} exceeds the maximum allowed size of ${friendlyMaxFileSize} ${unit}.`;
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (maxFileSize && selectedFile.size > maxFileSize) {
        setFileSizeError(
          constructErrorMessage(mediaType, selectedFile.size, maxFileSize),
        );
        setFile(undefined);
        // Reset file input value so selecting the same invalid file again triggers onChange
        event.target.value = "";
        return;
      } else {
        setFileSizeError("");
      }
      setFile(selectedFile);
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
            style={{ width, height }}
          >
            {accept.includes("video") ? (
              <VideoCall fontSize={"large"} />
            ) : (
              <AddAPhoto />
            )}
          </IconButton>
        </label>
      </Fragment>
    );
  };

  return (
    <Fragment>
      <FormControl sx={{ width: "fit-content" }}>
        <Stack
          alignItems="center"
          justifyContent="center"
          padding={1}
          borderRadius={2}
          border="1px dashed rgba(0, 0, 0, 0.23)"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              borderColor: "rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          {allowUpload && <Grid item>{renderUploadButton()}</Grid>}
          {mediaPreview && mediaType && (
            <Grid item>
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
          <Grid item>
            <Typography sx={{ opacity: 0.5, whiteSpace: "nowrap" }}>
              {label}
            </Typography>
          </Grid>
        </Stack>
      </FormControl>
      <CustomizedSnackbar
        getDefaultSnackbarStatus={setFileSizeError}
        defaultSnackbarStatus={Boolean(fileSizeError)}
        variant="error"
        message={fileSizeError}
        autoHideDuration={6000}
      />
    </Fragment>
  );
};
