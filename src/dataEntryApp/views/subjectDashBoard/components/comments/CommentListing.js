import { get, isEmpty, map, sortBy } from "lodash";
import { makeStyles } from "@mui/styles";
import { Box, Paper, Typography, TextField, Button, IconButton } from "@mui/material";
import { addNewComment, getCommentThreads, onCommentEdit, onThreadResolve, selectCommentState } from "../../../../reducers/CommentReducer";
import React, { useState } from "react";
import { Comment, ChevronRight, ChevronLeft } from "@mui/icons-material";
import { CommentCard } from "./CommentCard";
import { useSelector } from "react-redux";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  drawerHeader: {
    width: 500,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "space-between",
    backgroundColor: "#313a46"
  },
  commentButton: {
    color: "#3949ab",
    background: "#fff",
    "&:hover": {
      backgroundColor: "#bababa"
    }
  },
  iconContainer: {
    display: "flex",
    backgroundColor: "#556479",
    height: 40,
    width: 50,
    alignItems: "center",
    marginLeft: 5
  },
  root: {
    display: "flex",
    flexDirection: "column",
    width: 500,
    backgroundColor: "#f5f5f5",
    minHeight: "100vh"
  },
  firstComment: {
    width: 500,
    flexWrap: "wrap",
    padding: theme.spacing(3)
  },
  comment: {
    width: 450,
    flexWrap: "wrap",
    padding: theme.spacing(3)
  },
  inputText: {
    width: 450
  }
}));

export const CommentListing = ({ comments, dispatch, newCommentText, onCommentChange, subjectUUID, setOpen }) => {
  const classes = useStyles();
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
    <React.Fragment>
      <div className={classes.drawerHeader}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <div className={classes.iconContainer}>
            <IconButton onClick={() => dispatch(getCommentThreads(subjectUUID))} size="large">
              <ChevronLeft style={{ color: "#fff" }} />
            </IconButton>
          </div>
          <Comment style={{ color: "#fff", marginRight: 5, marginLeft: 5 }} />
          <Typography style={{ color: "#fff" }}>{t("Comments")}</Typography>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Button
            disabled={disableResolve}
            className={classes.commentButton}
            style={{ textTransform: "none" }}
            onClick={() => setOpenResolve(true)}
          >
            {t("resolveThread")}
          </Button>
          <div className={classes.iconContainer}>
            <IconButton onClick={() => setOpen(false)} size="large">
              <ChevronRight style={{ color: "#fff" }} />
            </IconButton>
          </div>
        </div>
      </div>
      <Paper elevation={0} className={classes.root}>
        {map(sortBy(comments, "createdDateTime"), (comment, index) => {
          return (
            <Box
              sx={[
                {
                  display: "flex",
                  alignItems: "center",
                  mb: 2
                },
                index === 0
                  ? {
                      justifyContent: "flex-start"
                    }
                  : {
                      justifyContent: "center"
                    }
              ]}
            >
              <Paper elevation={0} className={index === 0 ? classes.firstComment : classes.comment}>
                <CommentCard displayMenu comment={comment} dispatch={dispatch} setCommentToEdit={setCommentToEdit} />
              </Paper>
            </Box>
          );
        })}
        <Box
          sx={{
            mt: 3
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2
          }}
        >
          <Paper elevation={0} className={classes.inputText}>
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
          </Paper>
        </Box>
        <Box
          sx={{
            ml: 3
          }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={isEmpty(newCommentText)}
            onClick={() => (isEmpty(commentToEdit) ? onNewComment() : onEditComment())}
          >
            {isEmpty(commentToEdit) ? t("postComment") : t("editComment")}
          </Button>
        </Box>
        <Box
          sx={{
            pt: 10
          }}
        />
      </Paper>
      <ConfirmDialog
        setOpen={setOpenResolve}
        open={openResolve}
        title={t("threadResolveTitle")}
        message={t("threadResolveMessage")}
        onConfirm={() => dispatch(onThreadResolve())}
      />
    </React.Fragment>
  );
};
