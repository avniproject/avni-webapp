import { Grid, Typography } from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";
import { getFormattedDateTime } from "../../../../../adminApp/components/AuditUtil";
import { useSelector } from "react-redux";
import {
  onCommentDelete,
  selectDisplayUsername,
  setNewCommentText
} from "../../../../reducers/CommentReducer";
import Chip from "@material-ui/core/Chip";
import Colors from "../../../../Colors";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Fade from "@material-ui/core/Fade";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { useTranslation } from "react-i18next";

export const CommentCard = ({ comment, displayMenu, status, dispatch, setCommentToEdit }) => {
  const { t } = useTranslation();
  const myUsername = useSelector(selectDisplayUsername);
  const displayUsername = comment.displayUsername === myUsername ? "You" : comment.displayUsername;
  const textBreakPoint = displayMenu ? 10 : 9;
  const optionBreakPoint = displayMenu ? 1 : 2;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openDelete, setOpenDelete] = React.useState(false);
  const open = Boolean(anchorEl);

  const options = [
    {
      label: "Edit",
      onPress: () => {
        setAnchorEl(null);
        dispatch(setNewCommentText(comment.text));
        setCommentToEdit(comment);
      }
    },
    {
      label: "Delete",
      onPress: () => {
        setAnchorEl(null);
        setOpenDelete(true);
      }
    }
  ];

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
    return comment.displayUsername === myUsername ? (
      <div>
        <IconButton onClick={event => setAnchorEl(event.currentTarget)}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={() => setAnchorEl(null)}
          TransitionComponent={Fade}
        >
          {options.map(({ label, onPress }) => (
            <MenuItem key={label} onClick={onPress}>
              {label}
            </MenuItem>
          ))}
        </Menu>
      </div>
    ) : (
      <div />
    );
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
      <ConfirmDialog
        open={openDelete}
        setOpen={setOpenDelete}
        title={t("deleteCommentTitle")}
        message={t("deleteCommentMessage")}
        onConfirm={() => dispatch(onCommentDelete(comment.id))}
      />
    </Grid>
  );
};
