import { head, map, sortBy } from "lodash";
import { makeStyles } from "@mui/styles";
import { Grid, Paper, Typography, Card, CardActionArea, CardContent, Button, IconButton } from "@mui/material";
import { onThreadReply } from "../../../../reducers/CommentReducer";
import React, { useState } from "react";
import { Comment, ChevronRight } from "@mui/icons-material";
import NewCommentThreadDialog from "./NewCommentThreadDialog";
import { CommentCard } from "./CommentCard";
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
    width: 500,
    backgroundColor: "#f5f5f5",
    height: "100%",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    flexWrap: "wrap"
  }
}));
export const ThreadListing = ({ commentThreads, dispatch, setOpen, newCommentText, onCommentChange, subjectUUID }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [openCommentThread, setOpenCommentThread] = useState(false);
  return (
    <React.Fragment>
      <div className={classes.drawerHeader}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Comment style={{ color: "#fff", marginRight: 5, marginLeft: 5 }} />
          <Typography sx={{ color: "#fff" }}>{t("commentThreads")}</Typography>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Button className={classes.commentButton} style={{ textTransform: "none" }} onClick={() => setOpenCommentThread(true)}>
            {t("addComment")}
          </Button>
          <div className={classes.iconContainer}>
            <IconButton onClick={() => setOpen(false)} size="large">
              <ChevronRight style={{ color: "#fff" }} />
            </IconButton>
          </div>
        </div>
      </div>
      <Paper elevation={0} className={classes.root}>
        <Grid container spacing={1} direction={"column"}>
          {map(commentThreads, ({ id, status, comments }) => {
            const topComment = head(sortBy(comments, "createdDateTime"));
            return (
              <Grid key={id} size={12}>
                <Card>
                  <CardActionArea onClick={() => dispatch(onThreadReply(id))}>
                    <CardContent>
                      <CommentCard comment={topComment} status={status} dispatch={dispatch} />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
      <NewCommentThreadDialog
        dispatch={dispatch}
        open={openCommentThread}
        setOpen={setOpenCommentThread}
        newCommentText={newCommentText}
        onCommentChange={onCommentChange}
        subjectUUID={subjectUUID}
      />
    </React.Fragment>
  );
};
