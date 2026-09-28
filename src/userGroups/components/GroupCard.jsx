import { Link } from "react-router-dom";
import { DeleteOutline } from "@mui/icons-material";
import {
  CardActions,
  IconButton,
  CardContent,
  Typography,
  Card
} from "@mui/material";
import GroupModel from "../../common/model/GroupModel";

export const GroupCard = ({ groupName, href, hasAllPrivileges, onDelete }) => {
  const toUserGroupDetails = {
    pathname: href,
    search: `?groupName=${groupName}&hasAllPrivileges=${hasAllPrivileges}`
  };

  return (
    <Card
      raised
      sx={{
        width: 190,
        minHeight: 150,
        m: 2.5,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <CardContent
        component={Link}
        to={toUserGroupDetails}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: theme => theme.palette.primary.main,
            textAlign: "center",
            overflowWrap: "anywhere"
          }}
        >
          {groupName}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        <IconButton
          size="small"
          aria-label={`Delete ${groupName} group`}
          disabled={GroupModel.nonRemovableGroup(groupName)}
          onClick={onDelete}
        >
          <DeleteOutline />
        </IconButton>
      </CardActions>
    </Card>
  );
};