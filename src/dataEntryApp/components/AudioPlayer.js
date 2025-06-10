import React, { useEffect, useState } from "react";
import http from "../../common/utils/httpClient";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { IconButton, Dialog, DialogContent } from "@mui/material";
import { Close } from "@mui/icons-material";
import { withStyles } from "@mui/styles";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(0),
    color: theme.palette.grey[500]
  }
});

const StyledDialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <div className={classes.root} {...other}>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose} size="large">
          <Close />
        </IconButton>
      ) : null}
    </div>
  );
});

export const AudioPlayer = ({ url }) => {
  const { t } = useTranslation();
  const [signedURL, setSignedURL] = useState();
  const [openModal, setOpenModal] = useState(false);

  const updateSignedURL = () => http.get(`/media/signedUrl?url=${url}`).then(signedURL => setSignedURL(signedURL.data));

  useEffect(() => {
    updateSignedURL();
  }, []);

  React.useEffect(() => {
    const refreshedMediaUrls = setInterval(updateSignedURL, 110000);
    return () => clearInterval(refreshedMediaUrls);
  }, []);

  const onViewMedia = event => {
    event.preventDefault();
    setOpenModal(true);
  };

  return (
    <div>
      <Link to={"#"} onClick={onViewMedia}>
        {t("View Media")}
      </Link>{" "}
      |{" "}
      <Link to={`/app/audio?url=${signedURL}`} target="_blank">
        {t("Open in New Tab")}
      </Link>
      <Dialog onClose={() => setOpenModal(false)} open={openModal}>
        <StyledDialogTitle onClose={() => setOpenModal(false)} />
        <DialogContent>
          <audio autoPlay preload="auto" controls src={signedURL} controlsList="nodownload" />
        </DialogContent>
      </Dialog>
    </div>
  );
};
