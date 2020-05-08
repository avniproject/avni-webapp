import React from "react";
import { makeStyles } from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";
import IconButton from "@material-ui/core/IconButton";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import ReactMarkdown from "react-markdown";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative"
  },
  content: {
    position: "absolute",
    top: 30,
    right: 0,
    left: -120,
    zIndex: 1,
    padding: theme.spacing(1),
    backgroundColor: "#f7f7f7",
    maxWidth: "300px"
  }
}));

export const ToolTip = ({ toolTipKey, onHover }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    fetch(`/documentation/toolTip.json`)
      .then(res => res.json())
      .then(data => setMessage(data[toolTipKey] || "No key found"));
  }, []);

  const handleClick = () => {
    setOpen(prev => !prev);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const displayMarkup = () => (
    <Paper className={classes.content}>
      <ReactMarkdown source={message} escapeHtml={false} />
    </Paper>
  );

  const renderOnHover = () => {
    return (
      <div className={classes.root}>
        <IconButton
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          style={{ width: 0, height: 0 }}
        >
          <HelpIcon style={{ fontSize: "18px", color: "#6b6969" }} />
        </IconButton>
        {open ? displayMarkup() : null}
      </div>
    );
  };

  const renderOnClick = () => {
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className={classes.root}>
          <IconButton onClick={handleClick} style={{ width: 0, height: 0 }}>
            <HelpIcon style={{ fontSize: "18px", color: "#a19d9d" }} />
          </IconButton>
          {open ? displayMarkup() : null}
        </div>
      </ClickAwayListener>
    );
  };

  return onHover ? renderOnHover() : renderOnClick();
};
