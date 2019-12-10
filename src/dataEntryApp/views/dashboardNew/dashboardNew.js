import React from 'react';
import Header from './header';
import Content from './content';
import SideNav from './sideNav';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  }
}));

export default function dashboardNew() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <Header ></Header>
        </Grid>
        {/* <Grid item xs={4}>
          <SideNav></SideNav>
        </Grid>
        <Grid item xs={7}>
          <Content></Content>
        </Grid>         */}
      </Grid>
    </div>
  );
}
