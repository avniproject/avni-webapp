import React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { bold } from "ansi-colors";

const useStyles = makeStyles(theme => ({
  card: {
    boxShadow: "0px 0px 0px 0px",
    borderRadius: "0"
  },
  rightBorder: {
    borderRight: "1px solid rgba(0,0,0,0.12)",
    "&:nth-child(4n),&:last-child": {
      borderRight: "0px solid rgba(0,0,0,0.12)"
    },
    marginTop: "15px"
  },
  title: {
    fontSize: 14
  },
  headingBold: {
    fontWeight: bold
  },
  gridBottomBorder: {
    borderBottom: "1px solid rgba(0,0,0,0.12)",
    paddingBottom: "10px"
  }
}));

const GridCommonList = ({ gridListDetails }) => {
  const classes = useStyles();
  return (
    <Grid item xs={12} container className={classes.gridBottomBorder}>
      {gridListDetails
        ? gridListDetails.map(relative => {
            if (relative !== undefined) {
              return (
                <Grid item xs={3} className={classes.rightBorder}>
                  <Card className={classes.card}>
                    <CardContent>
                      <Typography color="primary">
                        {relative.firstName + " " + relative.lastName}
                      </Typography>
                      <Typography className={classes.title} color="textSecondary" gutterBottom>
                        {relative.individualBIsToARelation}
                      </Typography>
                      <Typography className={classes.title} color="textSecondary" gutterBottom>
                        {new Date().getFullYear() -
                          new Date(relative.dateOfBirth).getFullYear() +
                          " Year"}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button color="primary">REMOVE</Button>
                      <Button color="primary">EDIT</Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            }
          })
        : ""}
    </Grid>
  );
};

export default GridCommonList;
