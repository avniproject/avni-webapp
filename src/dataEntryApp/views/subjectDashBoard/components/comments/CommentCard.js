import { Grid, Typography } from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";
import { getFormattedDateTime } from "../../../../../adminApp/components/AuditUtil";
import { useSelector } from "react-redux";
import { selectDisplayUsername } from "../../../../reducers/CommentReducer";
import Chip from "@material-ui/core/Chip";
import Colors from "../../../../Colors";

export const CommentCard = ({ comment, displayMenu, status }) => {
  const myUsername = useSelector(selectDisplayUsername);
  const displayUsername = comment.displayUsername === myUsername ? "You" : comment.displayUsername;
  const textBreakPoint = displayMenu ? 10 : 9;
  const optionBreakPoint = displayMenu ? 1 : 2;

  const renderStatus = () => {
    return (
      <Chip
        label={status}
        style={{
          backgroundColor: status === "Open" ? Colors.ValidationError : Colors.SuccessColor,
          color: Colors.WhiteColor
        }}
      />
    );
  };

  const renderOptions = () => {
    return <MoreVertIcon />;
  };

  return (
    <Grid container direction={"row"}>
      <Grid item xs={1}>
        <AccountCircleIcon />
      </Grid>
      <Grid item xs={textBreakPoint} container direction={"column"} spacing={1}>
        <Grid item container direction={"column"}>
          <Grid item>{displayUsername}</Grid>
          <Grid item>{getFormattedDateTime(comment.createdDateTime)}</Grid>
        </Grid>
        <Grid item>
          <Typography gutterBottom variant="body1">
            {comment.text}
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={optionBreakPoint}>
        {displayMenu ? renderOptions() : renderStatus()}
      </Grid>
    </Grid>
  );
};
