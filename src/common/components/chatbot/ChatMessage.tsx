import React from "react";
import { Box, Paper, Typography, styled } from "@mui/material";
import { ChatMessageProps } from "./types";

const MessageContainer = styled(Box)<{ sender: string }>(
  ({ theme, sender }) => ({
    display: "flex",
    justifyContent: sender === "user" ? "flex-end" : "flex-start",
    marginBottom: "0.75rem",
    "& .message-bubble": {
      maxWidth: sender === "user" ? "80%" : "100%",
      padding: sender === "user" ? "0.75rem 1rem" : "1rem 0",
      borderRadius: sender === "user" ? "1.25rem 1.25rem 0.25rem 1.25rem" : "0",
      backgroundColor:
        sender === "user" ? theme.palette.primary.main : "transparent",
      color:
        sender === "user"
          ? theme.palette.primary.contrastText
          : sender === "error"
            ? theme.palette.error.main
            : theme.palette.text.primary,
      boxShadow:
        sender === "user" ? "0 0.125rem 0.5rem rgba(0,0,0,0.1)" : "none",
      animation: "slideIn 0.3s ease-out",
    },
  }),
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <MessageContainer sender={message.sender}>
      {message.sender === "user" ? (
        <Paper className="message-bubble" elevation={2}>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            {message.text}
          </Typography>
        </Paper>
      ) : (
        <Box className="message-bubble">
          <Typography
            variant="body1"
            sx={{ lineHeight: 1.6, fontSize: "1.1rem" }}
          >
            {message.text}
          </Typography>
        </Box>
      )}
    </MessageContainer>
  );
};

export default ChatMessage;
