import React from "react";
import ReactMarkdown from "react-markdown";
import { makeStyles } from "@material-ui/core";

const useStyle = makeStyles(theme => ({
  root: {
    opacity: 0.5
  }
}));

//Custom link renderer to open relative URLs in same tab and absolute URLs in new tab
export const LinkRenderer = props => {
  return props.href.startsWith("http") ? (
    <a href={props.href} target="_blank">
      {props.children}
    </a>
  ) : (
    <a href={props.href}>{props.children}</a>
  );
};

export const Documentation = ({ fileName }) => {
  const classes = useStyle();
  const [markdown, setMarkdown] = React.useState("");

  React.useEffect(() => {
    fetch(`/documentation/sideBarDocumentation/${fileName}`)
      .then(res => res.text())
      .then(setMarkdown);
  }, []);

  return (
    <div style={{ backgroundColor: "#f6f6f6", borderRadius: 10, padding: 16, margin: 7 }}>
      <ReactMarkdown
        source={markdown}
        escapeHtml={false}
        className={classes.root}
        renderers={{ link: LinkRenderer }}
      />
    </div>
  );
};
