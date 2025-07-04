import { useState, useEffect } from "react";
import { Help } from "@mui/icons-material";
import { ClickAwayListener, Paper } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import _ from "lodash";
import { LinkRenderer } from "./PlatformDocumentation";

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
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
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
      <ReactMarkdown children={message} rehypePlugins={[rehypeRaw, rehypeSanitize]} components={{ link: LinkRenderer }} />
    </Paper>
  );

  const renderOnHover = () => {
    return (
      <div style={styles.root}>
        <Help
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
          <Help onClick={handleClick} style={{ fontSize: "18px", color: "#a19d9d", cursor: "pointer" }} />
          {open ? displayMarkup() : null}
        </div>
      </ClickAwayListener>
    );
  };

  return onHover ? renderOnHover() : renderOnClick();
};
