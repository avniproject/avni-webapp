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

const INCOMPATIBLE_COLOR_SPACE_MESSAGE =
  "This image uses CMYK color mode, which the mobile app cannot display. Re-save it as RGB / sRGB and upload again.";

const readHeaderBytes = (file, byteCount) =>
  file
    .slice(0, Math.min(byteCount, file.size))
    .arrayBuffer()
    .then((buf) => new DataView(buf));

const isJpegCmyk = (view) => {
  if (view.byteLength < 4) return false;
  if (view.getUint16(0) !== 0xffd8) return false;
  let offset = 2;
  while (offset < view.byteLength - 1) {
    if (view.getUint8(offset) !== 0xff) return false;
    let marker = view.getUint8(offset + 1);
    offset += 2;
    while (marker === 0xff && offset < view.byteLength) {
      marker = view.getUint8(offset);
      offset += 1;
    }
    if (marker === 0xd8 || marker === 0xd9 || marker === 0xda) return false;
    if (offset + 2 > view.byteLength) return false;
    const segmentLength = view.getUint16(offset);
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isStartOfFrame) {
      const componentCountOffset = offset + 2 + 1 + 2 + 2;
      if (componentCountOffset >= view.byteLength) return false;
      return view.getUint8(componentCountOffset) === 4;
    }
    offset += segmentLength;
  }
  return false;
};

const detectIncompatibleColorSpace = async (file) => {
  try {
    const lower = toLower(file.name || "");
    const type = toLower(file.type || "");
    const isJpeg =
      type.includes("jpeg") ||
      type.includes("jpg") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg");
    if (!isJpeg) return false;
    const view = await readHeaderBytes(file, 65536);
    return isJpegCmyk(view);
  } catch {
    return false;
  }
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
  const isImage = toLower(mediaType) === toLower(MEDIA_TYPES.IMAGE);

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
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    const inputElement = event.target;
    if (maxFileSize && selectedFile.size > maxFileSize) {
      setFileSizeError(
        constructErrorMessage(mediaType, selectedFile.size, maxFileSize),
      );
      setFile(undefined);
      inputElement.value = "";
      return;
    }
    if (isImage && (await detectIncompatibleColorSpace(selectedFile))) {
      setFileSizeError(INCOMPATIBLE_COLOR_SPACE_MESSAGE);
      setFile(undefined);
      inputElement.value = "";
      return;
    }
    setFileSizeError("");
    setFile(selectedFile);
    if (onSelect) {
      onSelect(selectedFile);
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
          <Grid>
            <Typography sx={{ opacity: 0.5, whiteSpace: "nowrap" }}>
              {label}
            </Typography>
          </Grid>
        </Stack>
      </FormControl>
      <CustomizedSnackbar
        getDefaultSnackbarStatus={setFileSizeError}
        defaultSnackbarStatus={Boolean(fileSizeError)}
        variant={"error"}
        message={fileSizeError}
        autoHideDuration={6000}
      />
    </Fragment>
  );
};
