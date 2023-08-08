import React from "react";
import { Link } from "react-router-dom";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import {
  Grid,
  CardActions,
  Button,
  CardContent,
  Typography,
  CardActionArea,
  Card
} from "@material-ui/core";
import GroupModel from "../../common/model/GroupModel";

export const GroupCard = ({ groupName, href, hasAllPrivileges, onDelete }) => {
  const classes = {
    card: {
      width: 150,
      height: 100,
      justify: "center"
    },
    cardArea: {
      width: 150,
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
      height: 150,
      justify: "center",
      margin: 20,
      textDecoration: "none"
    }
  };

  const toUserGroupDetails = {
    pathname: href,
    search: `?groupName=${groupName}&hasAllPrivileges=${hasAllPrivileges}`
  };

  return (
    <Card style={classes.cardArea} raised={true}>
      <CardActionArea style={classes.card}>
        <Link to={toUserGroupDetails}>
          <CardContent>
            <Typography variant="h5" component="h2" align="center" color="primary">
              {groupName}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
      <CardActions>
        <Grid container justify="flex-end">
          <Grid item>
            <Button
              size="small"
              disabled={GroupModel.nonRemovableGroup(groupName)}
              onClick={onDelete}
            >
              <DeleteOutlineOutlinedIcon />
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};
