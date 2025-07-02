import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNews, selectNewsList } from "../../../../reducers/NewsReducer";
import { map } from "lodash";
import { makeStyles } from "@mui/styles";
import { Box, Grid, Paper, Divider, Typography } from "@mui/material";
import { NewsCard } from "./NewsCard";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    marginLeft: theme.spacing(15),
    marginRight: theme.spacing(15),
    padding: theme.spacing(8),
    paddingTop: theme.spacing(3)
  }
}));

export const NewsList = ({ match, ...props }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  useEffect(() => {
    dispatch(getNews());
  }, []);

  const newsList = useSelector(selectNewsList);

  return (
    <Paper elevation={0} className={classes.root}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {"News broadcast"}
      </Typography>
      <Typography style={{ opacity: 0.5 }} variant="body1" sx={{ mb: 1 }}>
        {"Below is the list of all news published"}
      </Typography>
      <Box
        sx={{
          mt: 2
        }}
      />
      <Divider />
      <Box
        sx={{
          mt: 2
        }}
      />
      <Grid container direction={"column"} spacing={3}>
        {map(newsList, news => (
          <Grid>
            <NewsCard {...news} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
