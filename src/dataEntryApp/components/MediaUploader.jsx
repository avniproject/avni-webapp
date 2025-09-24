import { Fragment, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  get,
  includes,
  isArrayLikeObject,
  isEmpty,
  lowerCase,
  omit,
  startsWith,
} from "lodash";
import { Box, Button, Grid, Typography, FormControl } from "@mui/material";
import { httpClient as deaHttpClient } from "../../common/utils/httpClient";

// Create scoped client for DataEntryApp with graceful error handling
const http = deaHttpClient.createScopedClientForDEA();
import {
  AddAPhoto,
  VideoCall,
  Audiotrack,
  CloudUpload,
  Close,
} from "@mui/icons-material";
import CustomizedBackdrop from "./CustomizedBackdrop";
import ReactImageVideoLightbox from "react-image-video-lightbox";
import { Concept } from "avni-models";
import { FilePreview } from "./FilePreview";
import MediaService from "../../adminApp/service/MediaService";

const StyledTypography = styled(Typography)({
  color: "rgba(0, 0, 0, 0.54)",
});

const StyledBox = styled(Box)(({ theme }) => ({
  minWidth: 200,
  minHeight: 50,
  marginTop: theme.spacing(0.625), // 5px
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
}));

const StyledIcon = styled("span")(({ theme }) => ({
  marginRight: theme.spacing(0.625), // 5px
  fontSize: 20,
}));

const StyledInput = styled("input")({
  display: "none",
});

const StyledErrorMessage = styled("p")(({ theme }) => ({
  color: "orangered",
  margin: theme.spacing(0.625), // 5px
  padding: theme.spacing(0.625), // 5px
  border: "1px solid #999",
  width: 200,
  height: 200,
  textAlign: "center",
  overflow: "scroll",
}));

const StyledDeleteButton = styled(Button)({
  float: "left",
  color: "red",
});

const StyledLightboxContainer = styled("div")({
  "& .reactLightbox": {
    zIndex: 2,
  },
});

const iconMap = {
  image: AddAPhoto,
  video: VideoCall,
  audio: Audiotrack,
  file: CloudUpload,
};

const getFileMimeType = (formElement) => {
  const allowedTypes = formElement.allowedTypes;
  return !isEmpty(allowedTypes) ? allowedTypes.join(",") : "*";
};

const isBiggerFile = (formElement, size) => {
  const allowedMaxSize = formElement.allowedMaxSize;
  return size > allowedMaxSize;
};

const isValidFile = (allowedTypes, type) => {
  return isEmpty(allowedTypes) ? true : includes(allowedTypes, type);
};

const isValidType = (formElement, type, isFile) => {
  return isFile
    ? isValidFile(formElement.allowedTypes, type)
    : includes(type, lowerCase(formElement.getType()));
};

function addObsResultsToPreview(observationValue, setPreview) {
  if (!isEmpty(observationValue)) {
    if (isArrayLikeObject(observationValue)) {
      observationValue.forEach((obsItrValue) => {
        MediaService.getMedia(obsItrValue).then((res) =>
          setPreview((oldPreview) => ({
            ...oldPreview,
            [obsItrValue]: res,
          })),
        );
      });
    } else {
      MediaService.getMedia(observationValue).then((res) =>
        setPreview({
          [observationValue]: res,
        }),
      );
    }
  }
}

function removeFileFromPreview(fileName, preview, setPreview) {
  preview[fileName] && URL.revokeObjectURL(preview[fileName]);
  setPreview((oldPreview) => omit(oldPreview, fileName));
}

function invokeUpdate(update, mediaUrl) {
  update(mediaUrl);
}

function addMediaUrlToLocalObsValue(
  update,
  fileName,
  isMultiSelect,
  localObsValue,
  setLocalObsValue,
) {
  invokeUpdate(update, fileName);
  if (isMultiSelect) {
    setLocalObsValue((locObsValue) =>
      locObsValue && !isArrayLikeObject(locObsValue)
        ? [locObsValue, fileName].filter((ele) => !isEmpty(ele))
        : [...(locObsValue || []), fileName].filter((ele) => !isEmpty(ele)),
    );
  } else {
    setLocalObsValue(fileName);
  }
}

function removeMediaUrlFromLocalObsValue(
  update,
  fileName,
  isMultiSelect,
  localObsValue,
  setLocalObsValue,
) {
  invokeUpdate(update, fileName);
  if (isMultiSelect && isArrayLikeObject(localObsValue)) {
    setLocalObsValue((locObsValue) =>
      locObsValue.filter((item) => item !== fileName),
    );
  } else {
    if (localObsValue === fileName) setLocalObsValue();
  }
}

function consolidateAlerts(etFiles, formElement, isFileDataType) {
  const alerts = [];
  etFiles.forEach((file) => {
    if (!isValidType(formElement, file.type, isFileDataType)) {
      alerts.push(
        `Selected files type not supported for file ${
          file.name
        }. Please choose proper files.\n`,
      );
    }
    if (isFileDataType && isBiggerFile(formElement, file.size)) {
      const oneMBInBytes = 1000000;
      alerts.push(
        `Selected file size ${
          file.size / oneMBInBytes
        } MB is more than the set max file size ${
          formElement.allowedMaxSize / oneMBInBytes
        } MB for file ${file.name}.\n`,
      );
    }
  });
  return alerts;
}

function uploadMediaAndUpdateObservationValue(
  etFiles,
  setUploadButtonClicked,
  setLocalObsValue,
  isMultiSelect,
  localObsValue,
  update,
  onDelete,
) {
  etFiles.forEach((file) => {
    const fileReader = new FileReader();
    file && fileReader.readAsText(file);
    setUploadButtonClicked((oldValue) => oldValue + 1);
    fileReader.onloadend = () => {
      http
        .uploadFile("/web/uploadMedia", file)
        .then((r) => {
          setUploadButtonClicked((oldValue) => oldValue - 1);
          addMediaUrlToLocalObsValue(
            update,
            r.data,
            isMultiSelect,
            localObsValue,
            setLocalObsValue,
          );
        })
        .catch((r) => {
          const error = `${
            get(r, "response.data") ||
            get(r, "message") ||
            "Unknown error occurred while uploading media"
          }`;
          setUploadButtonClicked((oldValue) => oldValue - 1);
          onDelete(file.name);
          alert(error);
        });
    };
  });
}

const MissingSignedMediaMessage = "Unable to fetch media";

export const MediaUploader = ({
  label,
  obsValue,
  mediaType,
  update,
  formElement,
}) => {
  const Icon = iconMap[mediaType];
  const [localObsValue, setLocalObsValue] = useState(obsValue);
  const [preview, setPreview] = useState({});
  const [uploadButtonClicked, setUploadButtonClicked] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [openImage, setOpenImage] = useState();
  const isFileDataType = formElement.getType() === Concept.dataType.File;
  const supportedMIMEType = isFileDataType
    ? getFileMimeType(formElement)
    : `${mediaType}/*`;
  const isMultiSelect = formElement.isMultiSelect();

  useEffect(() => {
    addObsResultsToPreview(localObsValue, setPreview);
  }, [localObsValue]);

  useEffect(() => {
    setUploading(uploadButtonClicked > 0);
  }, [uploadButtonClicked]);

  const onMediaSelect = (event) => {
    const etFiles = Array.from(event.target.files);
    const alerts = consolidateAlerts(etFiles, formElement, isFileDataType);
    if (!isEmpty(alerts)) {
      alert(alerts);
      return;
    }
    uploadMediaAndUpdateObservationValue(
      etFiles,
      setUploadButtonClicked,
      setLocalObsValue,
      isMultiSelect,
      localObsValue,
      update,
      onDelete,
    );
  };

  const onDelete = (fileName) => {
    removeMediaUrlFromLocalObsValue(
      update,
      fileName,
      isMultiSelect,
      localObsValue,
      setLocalObsValue,
    );
    removeFileFromPreview(fileName, preview, setPreview);
  };

  const mediaPreviewMap = (fileToPreview, label, previewValue) => ({
    image: (
      <img
        src={fileToPreview}
        alt={label}
        width={200}
        height={200}
        onClick={() => setOpenImage(fileToPreview)}
      />
    ),
    video: (
      <video
        preload="auto"
        controls
        width={200}
        height={200}
        controlsList="nodownload"
      >
        <source src={fileToPreview} type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    ),
    audio: (
      <audio
        preload="auto"
        controls
        src={fileToPreview}
        controlsList="nodownload"
      />
    ),
    file: <FilePreview url={fileToPreview} obsValue={previewValue} />,
  });

  const renderMedia = (fileName) => (
    <StyledBox>
      {startsWith(preview[fileName], MissingSignedMediaMessage) ? (
        <StyledErrorMessage>{preview[fileName]}</StyledErrorMessage>
      ) : (
        mediaPreviewMap(preview[fileName], MissingSignedMediaMessage, fileName)[
          mediaType
        ]
      )}
      <StyledDeleteButton onClick={() => onDelete(fileName)}>
        <Close />
      </StyledDeleteButton>
    </StyledBox>
  );

  const previewImage = () => {
    let startIndex = 0;
    const data = Object.entries(preview).map(([fileName, imgSrc], index) => {
      if (imgSrc === openImage) {
        startIndex = index;
      }
      return {
        url: imgSrc,
        type: "photo",
        altTag: fileName,
      };
    });
    return (
      <StyledLightboxContainer className="imagePreviewContainer">
        <ReactImageVideoLightbox
          data={data}
          startIndex={startIndex}
          showResourceCount={true}
          onCloseCallback={() => setOpenImage()}
        />
      </StyledLightboxContainer>
    );
  };

  return (
    <Fragment>
      <FormControl>
        <Grid
          container
          direction="row"
          spacing={1}
          sx={{ alignItems: "center" }}
        >
          <Grid>
            <StyledTypography variant="body1">{label}</StyledTypography>
          </Grid>
          <Grid>
            <Button variant="outlined" color="primary" component="label">
              <StyledIcon as={Icon} color="primary" />
              {`Upload ${mediaType}`}
              <StyledInput
                accept={supportedMIMEType}
                id="contained-button-file"
                type="file"
                multiple={isMultiSelect}
                onChange={onMediaSelect}
                onClick={(event) => (event.target.value = null)}
              />
            </Button>
          </Grid>
        </Grid>
      </FormControl>
      <Grid container direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {Object.keys(preview).map((fileName) => (
          <Grid key={fileName}>
            {preview[fileName] ? renderMedia(fileName) : null}
          </Grid>
        ))}
      </Grid>
      {openImage && previewImage()}
      <CustomizedBackdrop load={!uploading} />
    </Fragment>
  );
};
