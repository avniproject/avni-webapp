import React, { useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Drawer } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getCommentThreads, selectCommentState, setLoadCommentListing, setNewCommentText } from "../../../../reducers/CommentReducer";
import { ThreadListing } from "./ThreadListing";
import { CommentListing } from "./CommentListing";

const drawerWidth = 508;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: "#f5f5f5",
  },
}));

export const CommentDrawer = ({ open, setOpen, subjectUUID }) => {
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
    <StyledDrawer
      variant="persistent"
      anchor="right"
      open={open}
    >
      {!loadCommentListing && <ThreadListing commentThreads={commentThreads} {...commonProps} />}
      {loadCommentListing && <CommentListing comments={comments} {...commonProps} />}
    </StyledDrawer>
  );
};