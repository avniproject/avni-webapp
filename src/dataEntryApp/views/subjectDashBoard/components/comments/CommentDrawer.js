import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import CommentIcon from "@material-ui/icons/Comment";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { Grid, Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import NewCommentThreadDialog from "./NewCommentThreadDialog";
import { useDispatch, useSelector } from "react-redux";
import { getCommentThreads, selectCommentState } from "../../../../reducers/CommentReducer";
import { head, map, sortBy } from "lodash";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";

const drawerWidth = 500;

const useStyles = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
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
  rightContainer: {
    display: "flex",
    backgroundColor: "#556479",
    height: 40,
    width: 50,
    alignItems: "center",
    marginLeft: 5
  }
}));
export const CommentDrawer = ({ open, setOpen, subjectUUID }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [openCommentThread, setOpenCommentThread] = useState(false);
  const [newComment, setNewComment] = useState();
  const { commentThreads } = useSelector(selectCommentState);

  useEffect(() => {
    dispatch(getCommentThreads(subjectUUID));
  }, []);

  const onCommentChange = event => setNewComment(event.target.value);

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
      <div className={classes.drawerHeader}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <CommentIcon style={{ color: "#fff", marginRight: 5 }} />
          <Typography style={{ color: "#fff" }}>{"Comments"}</Typography>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Button
            className={classes.commentButton}
            style={{ textTransform: "none" }}
            onClick={() => setOpenCommentThread(true)}
          >
            {"Add comment"}
          </Button>
          <div className={classes.rightContainer}>
            <IconButton onClick={() => setOpen(false)}>
              <ChevronRightIcon style={{ color: "#fff" }} />
            </IconButton>
          </div>
        </div>
      </div>
      <Divider />
      <Grid container spacing={2} direction={"column"}>
        {map(commentThreads, ({ comments }) => {
          const topComment = head(sortBy(comments, "createdDateTime"));
          return (
            <Grid item xs={12}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {topComment.text}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button size="small" color="primary">
                    Reply
                  </Button>
                  <Button size="small" color="primary">
                    Resolve
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <NewCommentThreadDialog
        open={openCommentThread}
        setOpen={setOpenCommentThread}
        comment={newComment}
        onCommentChange={onCommentChange}
      />
    </Drawer>
  );
};
