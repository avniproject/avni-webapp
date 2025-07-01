import React from "react";
import { convertToRaw } from "draft-js";
import { makeStyles } from "@mui/styles";
import { Dialog, Box, DialogContent, GridLegacy as Grid, Typography, TextField } from "@mui/material";
import RichTextEditor from "./components/RichTextEditor";
import { ActionButton } from "./components/ActionButton";
import { AvniImageUpload } from "../common/components/AvniImageUpload";
import { isEmpty } from "lodash";
import { MediaFolder, uploadImage } from "../common/utils/S3Client";
import { newsInitialState, NewsReducer } from "./reducers";
import { dispatchActionAndClearError, displayErrorForKey } from "./utils";
import draftToHtml from "draftjs-to-html";
import DOMPurify from "dompurify";
import { CustomDialogTitle } from "./components/CustomDialogTitle";
import CustomizedBackdrop from "../dataEntryApp/components/CustomizedBackdrop";
import API from "./api";
import MuiComponentHelper from "../common/utils/MuiComponentHelper";
import { createServerError } from "../formDesigner/common/ErrorUtil";

const useStyles = makeStyles(theme => ({
  dialogPaper: {
    minHeight: "90%",
    minWidth: "80%"
  }
}));

export const CreateEditNews = ({ handleClose, open, headerTitle, edit, existingNews }) => {
  const classes = useStyles();
  const [news, dispatch] = React.useReducer(NewsReducer, newsInitialState);
  const [file, setFile] = React.useState();
  const [error, setError] = React.useState([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && edit) {
      dispatch({ type: "setData", payload: existingNews });
    }
  }, [open]);

  const getWordCount = () => {
    const plainText = news.editorState.getCurrentContent().getPlainText("");
    const regex = /(?:\r\n|\r|\n)/g;
    const cleanString = plainText.replace(regex, " ").trim();
    const wordArray = cleanString.match(/\S+/g);
    return wordArray ? wordArray.length : 0;
  };

  const isValidRequest = () => {
    const { title } = news;
    let isValid = true;
    setError([]);
    if (isEmpty(title)) {
      setError([...error, { key: "EMPTY_TITLE", message: "title cannot be empty" }]);
      isValid = false;
    }
    if (getWordCount() < 10) {
      setError([...error, { key: "LESS_CONTENT", message: "Please type at least 10 words" }]);
      isValid = false;
    }
    return isValid;
  };

  const onSave = async () => {
    const rawContent = convertToRaw(news.editorState.getCurrentContent());
    const content = JSON.stringify(rawContent);
    const contentHtml = DOMPurify.sanitize(draftToHtml(rawContent));
    if (isValidRequest()) {
      setSaving(true);
      const [s3FileKey, error] = await uploadImage(news.heroImage, file, MediaFolder.NEWS);
      if (error) {
        setSaving(false);
        alert(error);
        return;
      }
      const payload = {
        ...news,
        title: news.title,
        publishedDate: news.publishedDate,
        heroImage: s3FileKey,
        content,
        contentHtml
      };

      const response = edit ? API.editNews(payload) : API.createNews(payload);
      return response
        .then(res => {
          if (res.status === 200) {
            setSaving(false);
            dispatch({ type: "reset" });
            setFile(null);
            handleClose();
          }
        })
        .catch(error => {
          setSaving(false);
          setError([createServerError(error, "error while saving news")]);
        });
    }
  };

  return (
    <Dialog onClose={MuiComponentHelper.getDialogClosingHandler(handleClose)} classes={{ paper: classes.dialogPaper }} open={open}>
      <CustomDialogTitle onClose={handleClose}>{headerTitle}</CustomDialogTitle>
      <DialogContent>
        <Grid container spacing={4} direction={"column"}>
          <Grid item>
            <AvniImageUpload
              label={"Header image"}
              onSelect={setFile}
              oldImgUrl={news.heroImage}
              height={"300"}
              width={"100%"}
              renderButton={true}
            />
          </Grid>
          <Grid item>
            <Typography sx={{ opacity: 0.5 }}>{"News title"}</Typography>
            <TextField
              style={{ margin: 8 }}
              fullWidth
              margin="normal"
              value={news.title || ""}
              onChange={event => dispatchActionAndClearError("title", event.target.value, "EMPTY_TITLE", dispatch, error, setError)}
            />
            {displayErrorForKey(error, "EMPTY_TITLE")}
          </Grid>
          <Grid item>
            <Typography sx={{ opacity: 0.5 }}>{"News description"}</Typography>
            {open && (
              <Box
                sx={{
                  border: 1,
                  mt: 2,
                  borderColor: "#ddd",
                  p: 2
                }}
              >
                <RichTextEditor
                  editorState={news.editorState}
                  setEditorState={newState =>
                    dispatchActionAndClearError("editorState", newState, "LESS_CONTENT", dispatch, error, setError)
                  }
                />
              </Box>
            )}
            {displayErrorForKey(error, "LESS_CONTENT")}
          </Grid>
          <Grid item>{displayErrorForKey(error, "SERVER_ERROR")}</Grid>
          <Grid item>
            <ActionButton onClick={onSave} variant="contained" style={{ paddingHorizontal: 10 }} size="medium">
              {"Save Broadcast"}
            </ActionButton>
          </Grid>
        </Grid>
      </DialogContent>
      <CustomizedBackdrop load={!saving} />
    </Dialog>
  );
};
