import React from "react";
import { Box, TextField, IconButton, useTheme } from "@mui/material";
import { Send as SendIcon, Stop as StopIcon } from "@mui/icons-material";
import { MessageInputProps } from "./types";

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  inputRef,
  onKeyDown,
}) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      width="100%"
      gap={1}
      sx={{
        backgroundColor: "white",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        padding: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <TextField
        inputRef={inputRef}
        fullWidth
        multiline
        maxRows={3}
        variant="outlined"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            border: "none",
            "& fieldset": {
              border: "none",
            },
            "&:hover fieldset": {
              border: "none",
            },
            "&.Mui-focused fieldset": {
              border: "none",
            },
          },
        }}
      />
      <IconButton
        color="primary"
        onClick={isLoading ? onStop : onSend}
        disabled={!isLoading && !input.trim()}
        sx={{
          bgcolor: isLoading
            ? theme.palette.error.main
            : theme.palette.primary.main,
          color: "white",
          "&:hover": {
            bgcolor: isLoading
              ? theme.palette.error.dark
              : theme.palette.primary.dark,
          },
          "&:disabled": {
            bgcolor: theme.palette.grey[300],
          },
          borderRadius: 2,
          width: 40,
          height: 40,
        }}
      >
        {isLoading ? <StopIcon /> : <SendIcon />}
      </IconButton>
    </Box>
  );
};

export default MessageInput;
