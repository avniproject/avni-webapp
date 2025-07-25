import {
  Grid,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Fade
} from "@mui/material";
import { AccountCircle, MoreVert } from "@mui/icons-material";
import { useState } from "react";
import { getFormattedDateTime } from "../../../../../adminApp/components/AuditUtil";
import { useSelector } from "react-redux";
import {
  onCommentDelete,
  selectDisplayUsername,
  setNewCommentText
} from "../../../../reducers/CommentReducer";
import Colors from "../../../../Colors";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { useTranslation } from "react-i18next";

export const CommentCard = ({
  comment,
  displayMenu,
  status,
  dispatch,
  setCommentToEdit
}) => {
  const { t } = useTranslation();
  const myUsername = useSelector(selectDisplayUsername);
  const displayUsername =
    comment.displayUsername === myUsername ? "You" : comment.displayUsername;
  const textBreakPoint = displayMenu ? 10 : 9;
  const optionBreakPoint = displayMenu ? 1 : 2;
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
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
          backgroundColor:
            status === "Open" ? Colors.ValidationError : Colors.SuccessColor,
          color: Colors.WhiteColor
        }}
      />
    );
  };

  const renderOptions = () => {
    return comment.displayUsername === myUsername ? (
      <div>
        <IconButton
          onClick={event => setAnchorEl(event.currentTarget)}
          size="large"
        >
          <MoreVert />
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
      <Grid size={1}>
        <AccountCircle />
      </Grid>
      <Grid container direction={"column"} spacing={1} size={textBreakPoint}>
        <Grid container direction={"column"}>
          <Grid>{displayUsername}</Grid>
          <Grid>{getFormattedDateTime(comment.createdDateTime)}</Grid>
        </Grid>
        <Grid>
          <Typography sx={{ mb: 1 }} variant="body1">
            {comment.text}
          </Typography>
        </Grid>
      </Grid>
      <Grid size={optionBreakPoint}>
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
