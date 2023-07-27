import React from "react";
import { newsInitialState, NewsReducer } from "./reducers";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { CreateEditNews } from "./CreateEditNews";
import { Redirect } from "react-router-dom";
import { PublishBroadcast } from "./components/PublishBroadcast";
import { DeleteBroadcast } from "./components/DeleteBroadcast";
import API from "./api";
import NewsDetailsCard from "./components/NewsDetailsCard";

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
          <NewsDetailsCard
            news={news}
            history={history}
            displayActions={true}
            setDeleteAlert={setDeleteAlert}
            setOpenEdit={setOpenEdit}
            setPublishAlert={setPublishAlert}
          />
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
      {redirectToListing && <Redirect to="/broadcast/news" />}
    </ScreenWithAppBar>
  );
}
