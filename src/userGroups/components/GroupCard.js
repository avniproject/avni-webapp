import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import React from "react";
import Card from "@material-ui/core/Card";
import { Link } from "react-router-dom";

export const GroupCard = ({ name, href }) => {
  const classes = {
    card: {
      width: 150,
      height: 150,
      justify: "center"
    },
    cardArea: {
      width: 150,
      height: 150,
      justify: "center",
      margin: 20,
      textDecoration: "none"
    }
  };

  // let newTo = {
  //   pathname: href,
  //   state: name
  // };

  return (
    <CardActionArea style={classes.cardArea}>
      <Link to={href}>
        <Card style={classes.card} raised={true}>
          <CardContent>
            <Typography align="center" color="primary" />
          </CardContent>
          <Typography variant="h5" component="h2" align="center" color="primary">
            {name}
          </Typography>
        </Card>
      </Link>
    </CardActionArea>
  );
};
