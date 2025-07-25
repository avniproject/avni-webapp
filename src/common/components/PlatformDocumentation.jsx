import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

const StyledRoot = styled("div")(({ theme }) => ({
  opacity: 0.5,
  backgroundColor: "#f6f6f6",
  borderRadius: 10,
  padding: theme.spacing(2),
  margin: theme.spacing(0.875)
}));

// Custom link renderer to open relative URLs in same tab and absolute URLs in new tab
export const LinkRenderer = ({ href, children }) => {
  return href.startsWith("http") ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <a href={href}>{children}</a>
  );
};

export const PlatformDocumentation = ({ fileName }) => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    fetch(`/documentation/sideBarDocumentation/${fileName}`)
      .then(res => res.text())
      .then(setMarkdown);
  }, []);

  return (
    <StyledRoot>
      <ReactMarkdown
        children={markdown}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{ link: LinkRenderer }}
      />
    </StyledRoot>
  );
};
