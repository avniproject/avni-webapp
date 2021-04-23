import React, { Fragment, useEffect, useState } from "react";
import { get, isEmpty } from "lodash";
import { Box, Button, Grid, makeStyles, Typography } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import http from "../../common/utils/httpClient";
import AddAPhoto from "@material-ui/icons/AddAPhoto";
import VideoCall from "@material-ui/icons/VideoCall";
import Audiotrack from "@material-ui/icons/Audiotrack";
import CustomizedBackdrop from "./CustomizedBackdrop";
import CloseIcon from "@material-ui/icons/Close";
import ReactImageVideoLightbox from "react-image-video-lightbox";

const useStyles = makeStyles(theme => ({
  labelStyle: {
    color: "rgba(0, 0, 0, 0.54)"
  },
  boxStyle: {
    width: 200,
    height: 200,
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
  audio: Audiotrack
};

export const MediaUploader = ({ label, obsValue, mediaType, update }) => {
  const classes = useStyles();
  const Icon = iconMap[mediaType];
  const [value, setValue] = useState("");
  const [file, setFile] = useState();
  const [preview, setPreview] = useState();
  const [uploading, setUploading] = useState(false);
  const [openImage, setOpenImage] = useState(false);

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
      http
        .get(http.withParams(`/media/signedUrl`, { url: obsValue }))
        .then(res => res.data)
        .then(res => setPreview(res));
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
    setValue(event.target.value);
    const file = event.target.files[0];
    fileReader.onloadend = event => {
      setFile(file);
      setUploading(true);
      http
        .uploadFile(http.withParams("/web/uploadMedia", { mediaType }), file)
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
      <video controls width={200} height={200} controlsList="nodownload">
        <source src={preview} type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    ),
    audio: <audio controls src={preview} controlsList="nodownload" />
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
                accept={`${mediaType}/*`}
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
