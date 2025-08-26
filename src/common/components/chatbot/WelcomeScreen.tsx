import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { SmartToy as BotIcon } from "@mui/icons-material";
import { WelcomeScreenProps } from "./types";
import { WELCOME_MESSAGE } from "./constants";
import MessageInput from "./MessageInput";
import SuggestionCards from "./SuggestionCards";

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSuggestionClick,
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
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        backgroundColor: "white",
        padding: 3,
      }}
    >
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <BotIcon
          sx={{ fontSize: "5rem", color: theme.palette.primary.main, mb: 2 }}
        />
        <Typography variant="h5" sx={{ fontWeight: 500 }} gutterBottom>
          {WELCOME_MESSAGE.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontSize: "1.1rem" }}
          color="text.secondary"
        >
          {WELCOME_MESSAGE.subtitle}
        </Typography>
      </Box>

      <Box sx={{ mb: 3, width: "100%", maxWidth: "600px" }}>
        <MessageInput
          input={input}
          setInput={setInput}
          onSend={onSend}
          onStop={onStop}
          isLoading={isLoading}
          inputRef={inputRef}
          onKeyDown={onKeyDown}
        />
      </Box>

      <SuggestionCards onSuggestionClick={onSuggestionClick} />
    </Box>
  );
};

export default WelcomeScreen;
