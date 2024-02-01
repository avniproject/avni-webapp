import React, { Fragment, useEffect, useState } from "react";
import { get, isEmpty, includes, lowerCase } from "lodash";
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
  return isFile
    ? isValidFile(formElement.allowedTypes, type)
    : includes(type, lowerCase(formElement.getType()));
};

export const MediaUploader = ({ label, obsValue, mediaType, update, formElement }) => {
  const classes = useStyles();
  const Icon = iconMap[mediaType];
  const [value, setValue] = useState("");
  const [file, setFile] = useState();
  const [preview, setPreview] = useState();
  const [uploading, setUploading] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const isFileDataType = formElement.getType() === Concept.dataType.File;
  const supportedMIMEType = isFileDataType ? getFileMimeType(formElement) : `${mediaType}/*`;

  useEffect(() => {
    if (!file) {
      setPreview();
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!isEmpty(obsValue)) {
      MediaService.getMedia(obsValue).then(res => setPreview(res));
    }
  }, [obsValue]);

  useEffect(() => {
    if (openImage) {
      const LightBoxContainer = document.querySelector("div.imagePreviewContainer");
      LightBoxContainer.firstChild.style.zIndex = 1;
    }
  }, [openImage]);

  const onMediaSelect = event => {
    const fileReader = new FileReader();
    event.target.files[0] && fileReader.readAsText(event.target.files[0]);
    const file = event.target.files[0];
    if (!isValidType(formElement, file.type, isFileDataType)) {
      alert("Selected file type not supported. Please choose proper file.");
      return;
    }
    if (isFileDataType && isBiggerFile(formElement, file.size)) {
      const oneMBInBytes = 1000000;
      alert(
        `Selected file size ${file.size /
          oneMBInBytes} MB is more than the set max file size ${formElement.allowedMaxSize /
          oneMBInBytes} MB.`
      );
      return;
    }
    setValue(event.target.value);
    fileReader.onloadend = event => {
      setFile(file);
      setUploading(true);
      http
        .uploadFile("/web/uploadMedia", file)
        .then(r => {
          setUploading(false);
          update(r.data);
        })
        .catch(r => {
          const error = `${get(r, "response.data") ||
            get(r, "message") ||
            "Unknown error occurred while uploading media"}`;
          setUploading(false);
          onDelete();
          alert(error);
        });
    };
  };

  const onDelete = () => {
    setFile();
    setPreview();
    update();
    preview && URL.revokeObjectURL(preview);
  };

  const mediaPreviewMap = {
    image: (
      <img src={preview} alt={label} width={200} height={200} onClick={() => setOpenImage(true)} />
    ),
    video: (
      <video preload="auto" controls width={200} height={200} controlsList="nodownload">
        <source src={preview} type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    ),
    audio: <audio preload="auto" controls src={preview} controlsList="nodownload" />,
    file: <FilePreview url={preview} obsValue={obsValue} />
  };

  const renderMedia = () => {
    return (
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"flex-start"}
        className={classes.boxStyle}
      >
        {mediaPreviewMap[mediaType]}
        <Button style={{ float: "left", color: "red" }} onClick={onDelete}>
          <CloseIcon />
        </Button>
      </Box>
    );
  };

  const previewImage = () => {
    return (
      <div className="imagePreviewContainer">
        <ReactImageVideoLightbox
          data={[
            {
              url: preview,
              type: "photo",
              altTag: label
            }
          ]}
          startIndex={0}
          onCloseCallback={() => setOpenImage(false)}
        />
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
                value={value}
                onChange={onMediaSelect}
                style={{ display: "none" }}
                onClick={event => (event.target.value = null)}
              />
            </Button>
          </Grid>
        </Grid>
      </FormControl>
      <Grid item>{preview ? renderMedia() : null}</Grid>
      {openImage && previewImage()}
      <CustomizedBackdrop load={!uploading} />
    </Fragment>
  );
};
