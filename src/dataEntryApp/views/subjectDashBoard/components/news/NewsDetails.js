import React from "react";
import API from "../../../../../news/api";
import NewsDetailsCard from "../../../../../news/components/NewsDetailsCard";
import { makeStyles } from "@mui/styles";
import { Paper } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    marginLeft: theme.spacing(10),
    marginRight: theme.spacing(10),
    padding: theme.spacing(5),
    paddingTop: theme.spacing(3)
  }
}));

export default function NewsDetails({ history, ...props }) {
  const classes = useStyles();
  const [news, setNews] = React.useState({});
  React.useEffect(() => {
    API.getNewsById(props.match.params.id)
      .then(res => res.data)
      .then(res => setNews(res));
  }, []);

  return (
    <Paper className={classes.root}>
      <NewsDetailsCard news={news} history={history} displayActions={false} />
    </Paper>
  );
}
