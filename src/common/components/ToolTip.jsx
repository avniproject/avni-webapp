import { useState, useEffect, useId } from "react";
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
      display: "inline-block",
    },
    content: {
      position: "absolute",
      top:
        displayPosition === "top"
          ? -48
          : displayPosition === "bottom"
            ? 30
            : -10,
      right: _.includes(["top", "bottom"], displayPosition) ? 0 : -120,
      left: _.includes(["top", "bottom"], displayPosition) ? -120 : 20,
      zIndex: 1,
      paddingTop: "10px",
      paddingLeft: "10px",
      paddingRight: "10px",
      backgroundColor: "#f7f7f7",
      maxWidth: _.includes(["top", "bottom"], displayPosition)
        ? "300px"
        : "200px",
    },
  };
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const tooltipId = useId();

  useEffect(() => {
    fetch(`/documentation/toolTip.json`)
      .then((res) => res.json())
      .then((data) => setMessage(data[toolTipKey] || "No key found"));
  }, []);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const displayMarkup = () => (
    <Paper id={tooltipId} role="tooltip" style={styles.content}>
      <ReactMarkdown
        children={message}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{ link: LinkRenderer }}
      />
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
          <button
            type="button"
            aria-label={open ? "Hide help" : "Show help"}
            aria-expanded={open}
            aria-controls={tooltipId}
            aria-describedby={open ? tooltipId : undefined}
            data-tooltip-key={toolTipKey}
            onClick={handleClick}
            style={{
              padding: 0,
              border: 0,
              background: "none",
              cursor: "pointer",
              lineHeight: 0,
            }}
          >
            <Help
              aria-hidden="true"
              style={{ fontSize: "1.1rem", color: "#a19d9d" }}
            />
          </button>
          {open ? displayMarkup() : null}
        </div>
      </ClickAwayListener>
    );
  };

  return onHover ? renderOnHover() : renderOnClick();
};
