import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { Drawer } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getCommentThreads, selectCommentState, setLoadCommentListing, setNewCommentText } from "../../../../reducers/CommentReducer";
import { ThreadListing } from "./ThreadListing";
import { CommentListing } from "./CommentListing";

const drawerWidth = 508;

const useStyles = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
    backgroundColor: "#f5f5f5"
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: "#f5f5f5"
  }
}));
export const CommentDrawer = ({ open, setOpen, subjectUUID }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { commentThreads, comments, loadCommentListing, newCommentText } = useSelector(selectCommentState);

  useEffect(() => {
    if (open) {
      dispatch(getCommentThreads(subjectUUID));
      dispatch(setLoadCommentListing(false));
    }
  }, [open]);

  const onCommentChange = event => dispatch(setNewCommentText(event.target.value));
  const commonProps = { dispatch, onCommentChange, subjectUUID, newCommentText, setOpen };

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={open}
      classes={{
        paper: classes.drawerPaper
      }}
    >
      {!loadCommentListing && <ThreadListing commentThreads={commentThreads} {...commonProps} />}
      {loadCommentListing && <CommentListing comments={comments} {...commonProps} />}
    </Drawer>
  );
};
