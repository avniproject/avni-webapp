import React, { useEffect, useState } from "react";
import http from "../../common/utils/httpClient";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

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

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

export const AudioPlayer = ({ url }) => {
  const { t } = useTranslation();
  const [signedURL, setSignedURL] = useState();
  const [openModal, setOpenModal] = useState(false);

  const updateSignedURL = () =>
    http.get(`/media/signedUrl?url=${url}`).then(signedURL => setSignedURL(signedURL.data));

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
        <DialogTitle onClose={() => setOpenModal(false)} />
        <DialogContent>
          <audio autoPlay preload="auto" controls src={signedURL} controlsList="nodownload" />
        </DialogContent>
      </Dialog>
    </div>
  );
};
