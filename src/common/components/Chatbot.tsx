import React, { useState, useRef, useEffect } from "react";
import {
  Fab,
  Dialog,
  DialogContent,
  DialogActions,
  Paper,
  TextField,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Slide,
  useTheme,
  styled,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { useSelector } from "react-redux";
import httpClient from "../utils/httpClient";

interface Message {
  sender: "user" | "assistant" | "error";
  text: string;
  timestamp: Date;
}

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
  bottom: 24,
  right: 24,
  zIndex: 1300,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: "scale(1.1)",
  },
  transition: "all 0.3s ease",
  boxShadow: "0 8px 20px rgba(25, 118, 210, 0.3)",
}));

const MessageContainer = styled(Box)<{ sender: string }>(
  ({ theme, sender }) => ({
    display: "flex",
    justifyContent: sender === "user" ? "flex-end" : "flex-start",
    marginBottom: 12,
    "& .message-bubble": {
      maxWidth: "80%",
      padding: "12px 16px",
      borderRadius:
        sender === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
      backgroundColor:
        sender === "user"
          ? theme.palette.primary.main
          : sender === "error"
            ? theme.palette.error.light
            : theme.palette.grey[100],
      color:
        sender === "user"
          ? theme.palette.primary.contrastText
          : theme.palette.text.primary,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      animation: "slideIn 0.3s ease-out",
    },
  }),
);

const ChatHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  padding: "16px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "0",
}));

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const theme = useTheme();

  const genericConfig = useSelector(
    (state: any) => state.app?.genericConfig || {},
  );
  const configuredUrl =
    genericConfig.avniMcpServerUrl || "http://localhost:8023";

  // For local development, use relative path to go through Vite proxy
  const isLocalDevelopment = configuredUrl.includes("localhost");
  const chatEndpoint = isLocalDevelopment ? "/chat" : `${configuredUrl}/chat`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Create AbortController for request timeout and cancellation
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 60000);

    try {
      const authToken = httpClient.getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["AUTH-TOKEN"] = authToken;
      }

      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: currentInput }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server responded with ${response.status}: ${errorText}`,
        );
      }

      const responseData = await response.json();
      const aiMessage: Message = {
        sender: "assistant",
        text:
          responseData.response ||
          responseData.message ||
          "No response received",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error fetching AI response:", error);
      let errorText = "Failed to get response. Please try again.";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorText =
            "Request timed out after 60 seconds. The AI service may be busy, please try again.";
        } else if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          errorText =
            "Network connection issue. Please check your internet connection and try again.";
        } else if (error.message.includes("ERR_NETWORK_CHANGED")) {
          errorText =
            "Network connection changed during the request. Please try again.";
        } else if (error.message.includes("MCP server URL not configured")) {
          errorText =
            "AI service is not properly configured. Please contact your administrator.";
        } else {
          errorText = `Error: ${error.message}`;
        }
      }

      const errorMessage: Message = {
        sender: "error",
        text: errorText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

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
            height: "calc(100vh - 140px)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              padding: 3,
              backgroundColor: theme.palette.grey[50],
              maxWidth: "800px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            {messages.map((message, index) => (
              <MessageContainer key={index} sender={message.sender}>
                <Paper className="message-bubble" elevation={2}>
                  <Typography variant="body2">{message.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      fontSize: "0.7rem",
                      marginTop: 0.5,
                      display: "block",
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Paper>
              </MessageContainer>
            ))}

            {isLoading && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: 3,
            backgroundColor: "white",
            borderTop: `1px solid ${theme.palette.divider}`,
            maxWidth: "800px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Box display="flex" width="100%" gap={1}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
                "&:disabled": {
                  bgcolor: theme.palette.grey[300],
                },
                borderRadius: 2,
                width: 48,
                height: 48,
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
