import React from "react";
import {
  Fab,
  Dialog,
  DialogContent,
  Box,
  CircularProgress,
  Slide,
  useTheme,
  styled,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { useChatbot } from "./useChatbot";
import WelcomeScreen from "./WelcomeScreen";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: "1.5rem",
  right: "1.5rem",
  zIndex: 1300,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: "scale(1.1)",
  },
  transition: "all 0.3s ease",
  boxShadow: "0 0.5rem 1.25rem rgba(25, 118, 210, 0.3)",
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  padding: "1rem 1.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "0",
}));

const Chatbot: React.FC = () => {
  const theme = useTheme();
  const {
    messages,
    input,
    setInput,
    isOpen,
    setIsOpen,
    isLoading,
    messagesEndRef,
    inputRef,
    handleSend,
    handleStop,
    handleKeyPress,
    handleSuggestionClick,
  } = useChatbot();

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen && (
        <StyledFab
          color="primary"
          aria-label="open chat"
          onClick={() => setIsOpen(true)}
        >
          <ChatIcon />
        </StyledFab>
      )}

      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        fullScreen
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            height: "100vh",
            width: "100vw",
            maxWidth: "100vw",
            margin: 0,
            borderRadius: 0,
            overflow: "hidden",
            position: "fixed",
            top: 0,
            left: 0,
          },
        }}
      >
        <ChatHeader>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <BotIcon />
              <Typography variant="h6" component="div">
                AI Assistant
              </Typography>
            </Box>
            <Box sx={{ marginLeft: "auto" }}>
              <IconButton color="inherit" onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </ChatHeader>

        <DialogContent
          sx={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: messages.length === 0 ? "100vh" : "calc(100vh - 140px)",
            overflow: "hidden",
          }}
        >
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={handleSuggestionClick}
              input={input}
              setInput={setInput}
              onSend={() => handleSend()}
              onStop={handleStop}
              isLoading={isLoading}
              inputRef={inputRef}
              onKeyDown={handleKeyPress}
            />
          ) : (
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                padding: 3,
                backgroundColor: theme.palette.grey[50],
                maxWidth: "800px",
                margin: "0 auto",
                width: "100%",
                position: "relative",
              }}
            >
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}

              {isLoading && (
                <Box
                  display="flex"
                  justifyContent="flex-start"
                  alignItems="center"
                  gap={1}
                  p={2}
                >
                  <CircularProgress size={16} />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "1.1rem" }}
                    color="text.secondary"
                  >
                    Avni AI is thinking...
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </DialogContent>

        {messages.length > 0 && (
          <Box
            sx={{
              padding: 3,
              backgroundColor: theme.palette.grey[50],
              maxWidth: "800px",
              margin: "0 auto",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <MessageInput
              input={input}
              setInput={setInput}
              onSend={() => handleSend()}
              onStop={handleStop}
              isLoading={isLoading}
              inputRef={inputRef}
              onKeyDown={handleKeyPress}
            />
          </Box>
        )}
      </Dialog>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(0.625rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
