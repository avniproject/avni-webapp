import React, { Fragment, useEffect, useState } from "react";
import { get, includes, isArrayLikeObject, isEmpty, lowerCase, omit, startsWith } from "lodash";
import { Box, Button, Grid, makeStyles, Typography } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import http from "../../common/utils/httpClient";
import AddAPhoto from "@material-ui/icons/AddAPhoto";
import VideoCall from "@material-ui/icons/VideoCall";
import Audiotrack from "@material-ui/icons/Audiotrack";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CustomizedBackdrop from "./CustomizedBackdrop";
import CloseIcon from "@material-ui/icons/Close";
import ReactImageVideoLightbox from "react-image-video-lightbox";
import { Concept } from "avni-models";
import { FilePreview } from "./FilePreview";
import MediaService from "../../adminApp/service/MediaService";

const useStyles = makeStyles(theme => ({
  labelStyle: {
    color: "rgba(0, 0, 0, 0.54)"
  },
  boxStyle: {
    minWidth: 200,
    minHeight: 50,
    marginTop: 5
  },
  iconStyle: {
    marginRight: 5,
    fontSize: 20
  }
}));

const iconMap = {
  image: AddAPhoto,
  video: VideoCall,
  audio: Audiotrack,
  file: CloudUploadIcon
};

const getFileMimeType = formElement => {
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
  return isFile ? isValidFile(formElement.allowedTypes, type) : includes(type, lowerCase(formElement.getType()));
};

function addObsResultsToPreview(observationValue, setPreview) {
  if (!isEmpty(observationValue)) {
    if (isArrayLikeObject(observationValue)) {
      observationValue.forEach(obsItrValue => {
        MediaService.getMedia(obsItrValue).then(res =>
          setPreview(oldPreview => ({
            ...oldPreview,
            [obsItrValue]: res
          }))
        );
      });
    } else {
      MediaService.getMedia(observationValue).then(res =>
        setPreview({
          [observationValue]: res
        })
      );
    }
  }
}

function removeFileFromPreview(fileName, preview, setPreview) {
  preview[fileName] && URL.revokeObjectURL(preview[fileName]);
  setPreview(oldPreview => {
    return omit(oldPreview, fileName);
  });
}

/*
 * Push consolidated changes to ObservationHolder, doing it directly without state messes up the multi-select flows
 */
function invokeUpdate(update, mediaUrl) {
  update(mediaUrl);
}

function addMediaUrlToLocalObsValue(update, fileName, isMultiSelect, localObsValue, setLocalObsValue) {
  invokeUpdate(update, fileName);
  if (isMultiSelect) {
    setLocalObsValue(locObsValue =>
      locObsValue && !isArrayLikeObject(locObsValue)
        ? [locObsValue, fileName].filter(ele => !isEmpty(ele))
        : [...(locObsValue || []), fileName].filter(ele => !isEmpty(ele))
    );
  } else {
    setLocalObsValue(fileName);
  }
}

function removeMediaUrlFromLocalObsValue(update, fileName, isMultiSelect, localObsValue, setLocalObsValue) {
  invokeUpdate(update, fileName);
  if (isMultiSelect && isArrayLikeObject(localObsValue)) {
    setLocalObsValue(locObsValue => locObsValue.filter(item => item !== fileName));
  } else {
    if (localObsValue === fileName) setLocalObsValue(); //Remove previous value
  }
}

function consolidateAlerts(etFiles, formElement, isFileDataType, alerts) {
  etFiles.forEach(file => {
    if (!isValidType(formElement, file.type, isFileDataType)) {
      alerts.push(`Selected files type not supported for file ${file.name}. Please choose proper files.\n`);
    }
    if (isFileDataType && isBiggerFile(formElement, file.size)) {
      const oneMBInBytes = 1000000;
      alerts.push(
        `Selected file size ${file.size / oneMBInBytes} MB is more than the set max file size ${formElement.allowedMaxSize /
          oneMBInBytes} MB for file ${file.name}.\n`
      );
    }
  });
}

function uploadMediaAndUpdateObservationValue(
  etFiles,
  setUploadButtonClicked,
  setLocalObsValue,
  isMultiSelect,
  localObsValue,
  update,
  onDelete
) {
  etFiles.forEach(file => {
    const fileReader = new FileReader();
    file && fileReader.readAsText(file);
    setUploadButtonClicked(oldValue => oldValue + 1);
    fileReader.onloadend = event => {
      http
        .uploadFile("/web/uploadMedia", file)
        .then(r => {
          setUploadButtonClicked(oldValue => oldValue - 1);
          addMediaUrlToLocalObsValue(update, r.data, isMultiSelect, localObsValue, setLocalObsValue);
        })
        .catch(r => {
          const error = `${get(r, "response.data") || get(r, "message") || "Unknown error occurred while uploadButtonClicked media"}`;
          setUploadButtonClicked(oldValue => oldValue - 1);
          onDelete(file.name);
          alert(error);
        });
    };
  });
}

const MissingSignedMediaMessage = "Unable to fetch media";
export const MediaUploader = ({ label, obsValue, mediaType, update, formElement }) => {
  const classes = useStyles();
  const Icon = iconMap[mediaType];
  const [localObsValue, setLocalObsValue] = useState(obsValue);
  const [preview, setPreview] = useState({});
  const [uploadButtonClicked, setUploadButtonClicked] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [openImage, setOpenImage] = useState();
  const isFileDataType = formElement.getType() === Concept.dataType.File;
  const supportedMIMEType = isFileDataType ? getFileMimeType(formElement) : `${mediaType}/*`;
  const isMultiSelect = formElement.isMultiSelect() && !isFileDataType;

  useEffect(() => {
    addObsResultsToPreview(localObsValue, setPreview);
  }, [localObsValue]);

  useEffect(() => {
    setUploading(uploadButtonClicked > 0);
  }, [uploadButtonClicked]);

  useEffect(() => {
    if (openImage) {
      const LightBoxContainer = document.querySelector("div.imagePreviewContainer");
      LightBoxContainer.firstChild.style.zIndex = 2;
    }
  }, [openImage]);

  const onMediaSelect = event => {
    const alerts = [];
    const etFiles = Array.from(event.target.files);
    consolidateAlerts(etFiles, formElement, isFileDataType, alerts);
    if (!isEmpty(alerts)) {
      alert(alerts);
      return;
    }
    uploadMediaAndUpdateObservationValue(etFiles, setUploadButtonClicked, setLocalObsValue, isMultiSelect, localObsValue, update, onDelete);
  };

  const onDelete = fileName => {
    removeMediaUrlFromLocalObsValue(update, fileName, isMultiSelect, localObsValue, setLocalObsValue);
    removeFileFromPreview(fileName, preview, setPreview);
  };

  const mediaPreviewMap = (fileToPreview, label) => ({
    image: <img src={fileToPreview} alt={label} width={200} height={200} onClick={() => setOpenImage(fileToPreview)} />,
    video: (
      <video preload="auto" controls width={200} height={200} controlsList="nodownload">
        <source src={fileToPreview} type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    ),
    audio: <audio preload="auto" controls src={fileToPreview} controlsList="nodownload" />,
    file: <FilePreview url={fileToPreview} obsValue={obsValue} />
  });

  const renderMedia = fileName => {
    return (
      <Box display={"flex"} flexDirection={"row"} alignItems={"flex-start"} className={classes.boxStyle}>
        {startsWith(preview[fileName], MissingSignedMediaMessage) ? (
          <p
            style={{
              color: "orangered",
              margin: "5px",
              padding: "5px",
              border: "1px solid #999",
              width: "200px",
              height: "200px",
              textAlign: "center",
              overflow: "scroll"
            }}
          >
            {preview[fileName]}
          </p>
        ) : (
          mediaPreviewMap(preview[fileName], MissingSignedMediaMessage)[mediaType]
        )}
        <Button style={{ float: "left", color: "red" }} onClick={() => onDelete(fileName)}>
          <CloseIcon />
        </Button>
      </Box>
    );
  };

  const previewImage = () => {
    let startIndex = 0;
    const data = Object.entries(preview).map(([fileName, imgSrc], index) => {
      if (imgSrc === openImage) {
        startIndex = index;
      }
      return {
        url: imgSrc,
        type: "photo",
        altTag: fileName
      };
    });
    return (
      <div className="imagePreviewContainer">
        <ReactImageVideoLightbox data={data} startIndex={startIndex} showResourceCount={true} onCloseCallback={() => setOpenImage()} />
      </div>
    );
  };

  return (
    <Fragment>
      <FormControl>
        <Grid container direction="row" alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant="body1" className={classes.labelStyle}>
              {label}
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" component="label">
              <Icon color="primary" className={classes.iconStyle} />
              {`Upload ${mediaType}`}
              <input
                accept={supportedMIMEType}
                className={classes.input}
                id="contained-button-file"
                type="file"
                multiple={isMultiSelect}
                onChange={onMediaSelect}
                style={{ display: "none" }}
                onClick={event => (event.target.value = null)}
              />
            </Button>
          </Grid>
        </Grid>
      </FormControl>
      <Grid container direction="row" alignItems="center" spacing={1}>
        {Object.keys(preview).map(fileName => {
          return (
            <Grid item key={fileName}>
              {preview[fileName] ? renderMedia(fileName) : null}
            </Grid>
          );
        })}
      </Grid>
      {openImage && previewImage()}
      <CustomizedBackdrop load={!uploading} />
    </Fragment>
  );
};
