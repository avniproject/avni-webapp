import { Link } from "react-router-dom";
import { DeleteOutline } from "@mui/icons-material";
import {
  Grid,
  CardActions,
  Button,
  CardContent,
  Typography,
  CardActionArea,
  Card
} from "@mui/material";
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
            <Typography
              variant="h5"
              sx={{
                color: theme => theme.palette.primary.main,
                textAlign: "center"
              }}
            >
              {groupName}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
      <CardActions
        sx={{
          justifyContent: "flex-end"
        }}
      >
        <Grid container>
          <Grid>
            <Button
              size="small"
              disabled={GroupModel.nonRemovableGroup(groupName)}
              onClick={onDelete}
            >
              <DeleteOutline />
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};
