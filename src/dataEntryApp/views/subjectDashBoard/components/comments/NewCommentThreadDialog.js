import { styled } from "@mui/material/styles";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme, TextField } from "@mui/material";
import { onNewThread } from "../../../../reducers/CommentReducer";
import { useTranslation } from "react-i18next";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    position: "absolute",
    right: 0,
    width: 400
  }
}));

export default function NewCommentThreadDialog({ open, setOpen, newCommentText, onCommentChange, dispatch, subjectUUID }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("xl"));

  const onSave = () => {
    dispatch(onNewThread(newCommentText, subjectUUID));
    setOpen(false);
  };

  return (
    <div>
      <StyledDialog fullScreen={fullScreen} open={open} onClose={() => setOpen(false)}>
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
      </StyledDialog>
    </div>
  );
}
