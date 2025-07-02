import React from "react";
import { styled } from '@mui/material/styles';
import { convertToRaw } from "draft-js";
import { Dialog, Box, DialogContent, Grid, Typography, TextField } from "@mui/material";
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

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    minHeight: "90%",
    minWidth: "80%",
  },
}));

const StyledBox = styled(Box)(({ theme }) => ({
  border: 1,
  marginTop: theme.spacing(2),
  borderColor: "#ddd",
  padding: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1),
  width: "100%",
}));

const StyledActionButton = styled(ActionButton)(({ theme }) => ({
  padding: theme.spacing(0, 1.25),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  opacity: 0.5,
}));

export const CreateEditNews = ({ handleClose, open, headerTitle, edit, existingNews }) => {
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
        contentHtml,
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
    <StyledDialog onClose={MuiComponentHelper.getDialogClosingHandler(handleClose)} open={open}>
      <CustomDialogTitle onClose={handleClose}>{headerTitle}</CustomDialogTitle>
      <DialogContent>
        <Grid container spacing={4} direction="column">
          <Grid>
            <AvniImageUpload
              label="Header image"
              onSelect={setFile}
              oldImgUrl={news.heroImage}
              height="300"
              width="100%"
              renderButton={true}
            />
          </Grid>
          <Grid>
            <StyledTypography>News title</StyledTypography>
            <StyledTextField
              fullWidth
              margin="normal"
              value={news.title || ""}
              onChange={event => dispatchActionAndClearError("title", event.target.value, "EMPTY_TITLE", dispatch, error, setError)}
            />
            {displayErrorForKey(error, "EMPTY_TITLE")}
          </Grid>
          <Grid>
            <StyledTypography>News description</StyledTypography>
            {open && (
              <StyledBox>
                <RichTextEditor
                  editorState={news.editorState}
                  setEditorState={newState =>
                    dispatchActionAndClearError("editorState", newState, "LESS_CONTENT", dispatch, error, setError)
                  }
                />
              </StyledBox>
            )}
            {displayErrorForKey(error, "LESS_CONTENT")}
          </Grid>
          <Grid>{displayErrorForKey(error, "SERVER_ERROR")}</Grid>
          <Grid>
            <StyledActionButton onClick={onSave} variant="contained" size="medium">
              Save Broadcast
            </StyledActionButton>
          </Grid>
        </Grid>
      </DialogContent>
      <CustomizedBackdrop load={!saving} />
    </StyledDialog>
  );
};