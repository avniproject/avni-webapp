import React from "react";
import HelpIcon from "@material-ui/icons/Help";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import ReactMarkdown from "react-markdown";
import Paper from "@material-ui/core/Paper";
import _ from "lodash";
import { LinkRenderer } from "./Documentation";

export const ToolTip = ({ toolTipKey, onHover, displayPosition }) => {
  const styles = {
    root: {
      position: "relative",
      display: "inline-block"
    },
    content: {
      position: "absolute",
      top: displayPosition === "top" ? -48 : displayPosition === "bottom" ? 30 : -10,
      right: _.includes(["top", "bottom"], displayPosition) ? 0 : -120,
      left: _.includes(["top", "bottom"], displayPosition) ? -120 : 20,
      zIndex: 1,
      paddingTop: "10px",
      paddingLeft: "10px",
      paddingRight: "10px",
      backgroundColor: "#f7f7f7",
      maxWidth: _.includes(["top", "bottom"], displayPosition) ? "300px" : "200px"
    }
  };
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
    <Paper style={styles.content}>
      <ReactMarkdown source={message} escapeHtml={false} renderers={{ link: LinkRenderer }} />
    </Paper>
  );

  const renderOnHover = () => {
    return (
      <div style={styles.root}>
        <HelpIcon
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          style={{ fontSize: "18px", color: "#6b6969", cursor: "pointer" }}
        />
        {open ? displayMarkup() : null}
      </div>
    );
  };

  const renderOnClick = () => {
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <div style={styles.root}>
          <HelpIcon
            onClick={handleClick}
            style={{ fontSize: "18px", color: "#a19d9d", cursor: "pointer" }}
          />
          {open ? displayMarkup() : null}
        </div>
      </ClickAwayListener>
    );
  };

  return onHover ? renderOnHover() : renderOnClick();
};
