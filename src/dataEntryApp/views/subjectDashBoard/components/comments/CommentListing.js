import { get, isEmpty, map, sortBy } from "lodash";
import { Box, makeStyles, Paper, Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import {
  addNewComment,
  getCommentThreads,
  onCommentEdit,
  onThreadResolve,
  selectCommentState
} from "../../../../reducers/CommentReducer";
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CommentIcon from "@material-ui/icons/Comment";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { CommentCard } from "./CommentCard";
import { useSelector } from "react-redux";

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

export const CommentListing = ({
  comments,
  dispatch,
  newCommentText,
  onCommentChange,
  subjectUUID,
  setOpen
}) => {
  const classes = useStyles();
  const { activeThread } = useSelector(selectCommentState);
  const disableResolve = get(activeThread, "status", "Open") === "Resolved";
  const [commentToEdit, setCommentToEdit] = useState(undefined);

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
            <IconButton onClick={() => dispatch(getCommentThreads(subjectUUID))}>
              <ChevronLeftIcon style={{ color: "#fff" }} />
            </IconButton>
          </div>
          <CommentIcon style={{ color: "#fff", marginRight: 5, marginLeft: 5 }} />
          <Typography style={{ color: "#fff" }}>{"Comments"}</Typography>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Button
            disabled={disableResolve}
            className={classes.commentButton}
            style={{ textTransform: "none" }}
            onClick={() => dispatch(onThreadResolve())}
          >
            {"Resolve thread"}
          </Button>
          <div className={classes.iconContainer}>
            <IconButton onClick={() => setOpen(false)}>
              <ChevronRightIcon style={{ color: "#fff" }} />
            </IconButton>
          </div>
        </div>
      </div>
      <Paper elevation={0} className={classes.root}>
        {map(sortBy(comments, "createdDateTime"), (comment, index) => {
          return (
            <Box
              display="flex"
              justifyContent={index === 0 ? "flex-start" : "center"}
              alignItems="center"
              mb={2}
            >
              <Paper elevation={0} className={index === 0 ? classes.firstComment : classes.comment}>
                <CommentCard
                  displayMenu
                  comment={comment}
                  dispatch={dispatch}
                  setCommentToEdit={setCommentToEdit}
                />
              </Paper>
            </Box>
          );
        })}
        <Box mt={3} />
        <Box display="flex" justifyContent={"center"} alignItems="center" mb={2}>
          <Paper elevation={0} className={classes.inputText}>
            <TextField
              fullWidth
              id="new-comment"
              label="What's your response?"
              placeholder="What's your response?"
              multiline
              variant="outlined"
              value={newCommentText}
              onChange={onCommentChange}
            />
          </Paper>
        </Box>
        <Box ml={3}>
          <Button
            variant="contained"
            color="primary"
            disabled={isEmpty(newCommentText)}
            onClick={() => (isEmpty(commentToEdit) ? onNewComment() : onEditComment())}
          >
            {isEmpty(commentToEdit) ? "Post comment" : "Edit comment"}
          </Button>
        </Box>
        <Box pt={10} />
      </Paper>
    </React.Fragment>
  );
};
