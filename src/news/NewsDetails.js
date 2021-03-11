import React from "react";
import { newsInitialState, NewsReducer } from "./reducers";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import Paper from "@material-ui/core/Paper";
import { Box, Grid, Typography } from "@material-ui/core";
import { getFormattedDateTime } from "../adminApp/components/AuditUtil";
import { makeStyles } from "@material-ui/core/styles";
import { ActionButton } from "./components/ActionButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import { AvniImageUpload } from "../common/components/AvniImageUpload";
import { CreateEditNews } from "./CreateEditNews";
import { Redirect } from "react-router-dom";
import { PublishBroadcast } from "./components/PublishBroadcast";
import { DeleteBroadcast } from "./components/DeleteBroadcast";
import { isNil } from "lodash";
import API from "./api";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: 10,
    margin: "auto",
    maxWidth: "70%"
  },
  image: {
    width: 128,
    height: 128
  },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%"
  }
}));

export default function NewsDetails({ history, ...props }) {
  const [news, dispatch] = React.useReducer(NewsReducer, newsInitialState);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [redirectToListing, setRedirectToListing] = React.useState(false);
  const [deleteAlert, setDeleteAlert] = React.useState(false);
  const [publishAlert, setPublishAlert] = React.useState(false);
  const classes = useStyles();

  React.useEffect(() => {
    API.getNewsById(props.match.params.id)
      .then(res => res.data)
      .then(res => {
        dispatch({ type: "setData", payload: res });
      });
  }, [openEdit]);

  return (
    <ScreenWithAppBar appbarTitle={"News broadcast"}>
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Grid container direction="row" alignItems={"center"}>
            <Grid item container xs={6} direction={"column"}>
              <Grid item>
                <a href={`#/news`}>
                  <Typography variant="h6" gutterBottom>
                    {"< Back"}
                  </Typography>
                </a>
              </Grid>
              <Grid item>
                <Typography variant="h6" gutterBottom>
                  {news.title}
                </Typography>
              </Grid>
              <Grid item>
                <Typography style={{ opacity: 0.7 }} variant="body2">
                  {getFormattedDateTime(news.createdDateTime)}
                </Typography>
              </Grid>
            </Grid>
            <Grid item container justify={"flex-end"} spacing={2} xs={6}>
              <Grid item>
                <Button style={{ color: "red" }} onClick={() => setDeleteAlert(true)}>
                  <DeleteIcon /> Delete
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary" type="button" onClick={() => setOpenEdit(true)}>
                  <EditIcon />
                  Edit
                </Button>
              </Grid>
              <Grid item>
                <ActionButton
                  disabled={!isNil(news.publishedDate)}
                  onClick={() => setPublishAlert(true)}
                  variant="contained"
                  style={{ paddingHorizontal: 10 }}
                  size="medium"
                >
                  {"Broadcast this news"}
                </ActionButton>
              </Grid>
            </Grid>
          </Grid>
          <Box mt={2} />
          <Divider />
          <Box mt={2} />
          <Grid container spacing={5} direction="column" alignItems={"center"}>
            <Grid item>
              <AvniImageUpload oldImgUrl={news.heroImage} height={"300"} width={"100%"} />
            </Grid>
            <Grid item container justify="flex-start">
              <div dangerouslySetInnerHTML={{ __html: news.contentHtml }} />
            </Grid>
          </Grid>
        </Paper>
        <CreateEditNews
          open={openEdit}
          headerTitle={"Edit news broadcast"}
          handleClose={() => setOpenEdit(false)}
          edit={true}
          existingNews={news}
        />
        <PublishBroadcast
          open={publishAlert}
          setOpen={setPublishAlert}
          setRedirect={setRedirectToListing}
          news={news}
        />
        <DeleteBroadcast
          open={deleteAlert}
          setOpen={setDeleteAlert}
          setRedirect={setRedirectToListing}
          news={news}
        />
      </div>
      {redirectToListing && <Redirect to="/news" />}
    </ScreenWithAppBar>
  );
}
