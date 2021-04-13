import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { onNewThread } from "../../../../reducers/CommentReducer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  dialogPosition: {
    position: "absolute",
    right: 0,
    width: 400
  }
}));

export default function NewCommentThreadDialog({
  open,
  setOpen,
  newCommentText,
  onCommentChange,
  dispatch,
  subjectUUID
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const onSave = () => {
    dispatch(onNewThread(newCommentText, subjectUUID));
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        classes={{ paper: classes.dialogPosition }}
        fullScreen={fullScreen}
        open={open}
        onClose={() => setOpen(false)}
      >
        <DialogTitle id="new-comment-thread">{t("createNewCommentThread")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            id="new-thread"
            label={t("newThreadLabel")}
            placeholder={t("newThreadLabel")}
            multiline
            variant="outlined"
            value={newCommentText}
            onChange={onCommentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setOpen(false)} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={onSave} color="primary" autoFocus>
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
