import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";
import React from "react";
import Card from "@material-ui/core/Card";
import { Link } from "react-router-dom";

export const GroupCard = ({ groupName, href, hasAllPrivileges }) => {
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

  let toUserGroupDetails = {
    pathname: href,
    search: `?groupName=${groupName}&hasAllPrivileges=${hasAllPrivileges}`
    // state: {"groupName": groupName, "hasAllPrivileges": hasAllPrivileges} //TODO why isn't this working??
  };

  return (
    <CardActionArea style={classes.cardArea}>
      <Link to={toUserGroupDetails}>
        <Card style={classes.card} raised={true}>
          <CardContent>
            <Typography align="center" color="primary" />
          </CardContent>
          <Typography variant="h5" component="h2" align="center" color="primary">
            {groupName}
          </Typography>
        </Card>
      </Link>
    </CardActionArea>
  );
};
