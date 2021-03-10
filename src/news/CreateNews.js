import React, { useState } from "react";
import { convertToRaw, EditorState } from "draft-js";
import Dialog from "@material-ui/core/Dialog";
import { Box, DialogContent, Grid, makeStyles, Typography } from "@material-ui/core";
import DraftEditor from "./components/DraftEditor";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import { ActionButton } from "./components/ActionButton";
import TextField from "@material-ui/core/TextField";
import { AvniImageUpload } from "../common/components/AvniImageUpload";
import { isNil } from "lodash";
import http from "../common/utils/httpClient";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
});
const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </MuiDialogTitle>
  );
});

const useStyles = makeStyles(theme => ({
  dialogPaper: {
    minHeight: "90%",
    minWidth: "80%"
  }
}));

export const CreateNews = ({ handleClose, open, headerTitle, edit, id }) => {
  const classes = useStyles();
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [htmlContent, setHtmlContent] = useState(null);
  const [file, setFile] = React.useState();
  const [title, setTitle] = React.useState();

  const onSave = async () => {
    //TODO: upload image to s3
    const url = edit ? `/web/news/${id}` : "/web/news";
    const methodName = edit ? "put" : "post";
    return http[methodName](url, {
      title: title,
      publishedDate: "", //
      heroImage: "", //
      content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
      contentHtml: htmlContent
    })
      .then(res => {
        if (res.status === 200) {
          handleClose();
        }
      })
      .catch(error => console.error(error));
  };

  return (
    <Dialog disableBackdropClick classes={{ paper: classes.dialogPaper }} open={open}>
      <DialogTitle onClose={handleClose}>{headerTitle}</DialogTitle>
      <DialogContent>
        <Grid container spacing={4} direction={"column"}>
          <Grid item>
            EditorState{" "}
            <AvniImageUpload
              canSelect={true}
              canUpload={!isNil(file)}
              onSelect={setFile}
              height={"300"}
              width={"100%"}
            />
          </Grid>
          <Grid item>
            <Typography style={{ opacity: 0.5 }}>{"News title"}</Typography>
            <TextField
              style={{ margin: 8 }}
              fullWidth
              margin="normal"
              value={title || ""}
              onChange={event => setTitle(event.target.value)}
            />
          </Grid>
          <Grid item>
            <Typography style={{ opacity: 0.5 }}>{"News description"}</Typography>
            <Box border={1} mt={2} borderColor={"#ddd"} p={2}>
              <DraftEditor
                editorState={editorState}
                setEditorState={setEditorState}
                setHtmlContent={setHtmlContent}
              />
            </Box>
          </Grid>
          <Grid item>
            <ActionButton
              onClick={onSave}
              variant="contained"
              style={{ paddingHorizontal: 10 }}
              size="medium"
            >
              {"Save Broadcast"}
            </ActionButton>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
