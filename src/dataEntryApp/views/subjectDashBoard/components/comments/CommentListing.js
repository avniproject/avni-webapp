import { get, isEmpty, map, sortBy } from "lodash";
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, TextField, Button, IconButton } from "@mui/material";
import { addNewComment, getCommentThreads, onCommentEdit, onThreadResolve, selectCommentState } from "../../../../reducers/Comment/reducer";
import React, { useState, Fragment } from "react";
import { Comment, ChevronRight, ChevronLeft } from "@mui/icons-material";
import { CommentCard } from "./CommentCard";
import { useSelector } from "react-redux";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { useTranslation } from "react-i18next";

const StyledHeader = styled('div')(({ theme }) => ({
  width: 500,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  backgroundColor: "#313a46",
}));

const StyledIconContainer = styled('div')(({ theme }) => ({
  display: "flex",
  backgroundColor: "#556479",
  height: 40,
  width: 50,
  alignItems: "center",
  marginLeft: 5,
}));

const StyledCommentButton = styled(Button)(({ theme }) => ({
  color: "#3949ab",
  background: "#fff",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#bababa",
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: 500,
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
}));

const StyledFirstComment = styled(Paper)(({ theme }) => ({
  width: 500,
  flexWrap: "wrap",
  padding: theme.spacing(3),
}));

const StyledComment = styled(Paper)(({ theme }) => ({
  width: 450,
  flexWrap: "wrap",
  padding: theme.spacing(3),
}));

const StyledInputText = styled(Paper)(({ theme }) => ({
  width: 450,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const StyledCommentHeader = styled(Typography)(({ theme }) => ({
  color: "#fff",
}));

const StyledChevronIcon = styled(ChevronLeft)(({ theme }) => ({
  color: "#fff",
}));

const StyledCommentIcon = styled(Comment)(({ theme }) => ({
  color: "#fff",
  marginRight: 5,
  marginLeft: 5,
}));

export const CommentListing = ({ comments, dispatch, newCommentText, onCommentChange, subjectUUID, setOpen }) => {
  const { t } = useTranslation();
  const { activeThread } = useSelector(selectCommentState);
  const disableResolve = get(activeThread, "status", "Open") === "Resolved";
  const [commentToEdit, setCommentToEdit] = useState(undefined);
  const [openResolve, setOpenResolve] = useState(false);

  const onEditComment = () => {
    setCommentToEdit(undefined);
    dispatch(onCommentEdit(commentToEdit, newCommentText));
  };

  const onNewComment = () => dispatch(addNewComment(subjectUUID));

  return (
    <Fragment>
      <StyledHeader>
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <StyledIconContainer>
            <IconButton onClick={() => dispatch(getCommentThreads(subjectUUID))} size="large">
              <StyledChevronIcon />
            </IconButton>
          </StyledIconContainer>
          <StyledCommentIcon />
          <StyledCommentHeader>{t("Comments")}</StyledCommentHeader>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <StyledCommentButton
            disabled={disableResolve}
            onClick={() => setOpenResolve(true)}
          >
            {t("resolveThread")}
          </StyledCommentButton>
          <StyledIconContainer>
            <IconButton onClick={() => setOpen(false)} size="large">
              <ChevronRight style={{ color: "#fff" }} />
            </IconButton>
          </StyledIconContainer>
        </Box>
      </StyledHeader>
      <StyledPaper elevation={0}>
        {map(sortBy(comments, "createdDateTime"), (comment, index) => (
          <StyledBox
            key={comment.id}
            sx={{
              justifyContent: index === 0 ? "flex-start" : "center",
            }}
          >
            <Paper elevation={0} component={index === 0 ? StyledFirstComment : StyledComment}>
              <CommentCard displayMenu comment={comment} dispatch={dispatch} setCommentToEdit={setCommentToEdit} />
            </Paper>
          </StyledBox>
        ))}
        <Box sx={{ marginTop: 3 }} />
        <StyledBox sx={{ justifyContent: "center" }}>
          <StyledInputText elevation={0}>
            <TextField
              fullWidth
              id="new-comment"
              label={t("newCommentLabel")}
              placeholder={t("newCommentLabel")}
              multiline
              variant="outlined"
              value={newCommentText}
              onChange={onCommentChange}
            />
          </StyledInputText>
        </StyledBox>
        <Box sx={{ marginLeft: 3 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={isEmpty(newCommentText)}
            onClick={() => (isEmpty(commentToEdit) ? onNewComment() : onEditComment())}
          >
            {isEmpty(commentToEdit) ? t("postComment") : t("editComment")}
          </Button>
        </Box>
        <Box sx={{ paddingTop: 10 }} />
      </StyledPaper>
      <ConfirmDialog
        setOpen={setOpenResolve}
        open={openResolve}
        title={t("threadResolveTitle")}
        message={t("threadResolveMessage")}
        onConfirm={() => dispatch(onThreadResolve())}
      />
    </Fragment>
  );
};