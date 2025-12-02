import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Clear, Send } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper to normalize content for markdown rendering
const normalizeMarkdownContent = (content) => {
  if (!content) return "";
  // Replace literal \n with actual newlines if they exist as escaped strings
  let normalized = content.replace(/\\n/g, "\n");
  // Ensure proper line breaks for markdown tables
  return normalized;
};

const AiRuleCreationModal = ({
  open,
  onClose,
  onSubmit,
  title = "Create Rule with AI",
  placeholder = "Describe your rule requirements...",
  loading = false,
  error = null,
  conversationHistory = [],
}) => {
  const [userInput, setUserInput] = useState("");

  // Clear input when modal opens
  useEffect(() => {
    if (open) {
      setUserInput("");
    }
  }, [open]);

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = () => {
    if (userInput.trim() && onSubmit) {
      onSubmit(userInput);
      setUserInput("");
    }
  };

  const handleClear = () => {
    setUserInput("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
            {error}
          </Typography>
        )}

        {/* Conversation History Display */}
        {conversationHistory.length > 0 && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: "bold" }}>
              Conversation History:
            </Typography>
            {conversationHistory.map((message, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderLeft: 3,
                  borderLeftColor:
                    message.role === "user" ? "primary.main" : "success.main",
                  bgcolor: "white",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      message.role === "user" ? "primary.main" : "success.main",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {message.role === "user" ? "You" : "AI Assistant"}
                  {message.type && ` (${message.type})`}
                </Typography>
                {message.role === "user" ? (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      whiteSpace: "pre-line",
                      fontSize: "0.875rem",
                    }}
                  >
                    {message.content}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      mt: 0.5,
                      fontSize: "0.875rem",
                      "& p": { margin: "0.5em 0" },
                      "& pre": {
                        bgcolor: "grey.100",
                        p: 1.5,
                        borderRadius: 1,
                        overflow: "auto",
                        fontSize: "0.75rem",
                      },
                      "& code": {
                        fontFamily: "monospace",
                        bgcolor: "grey.100",
                        px: 0.5,
                        borderRadius: 0.5,
                        fontSize: "0.8em",
                      },
                      "& pre code": {
                        bgcolor: "transparent",
                        px: 0,
                      },
                      "& table": {
                        borderCollapse: "collapse",
                        width: "100%",
                        my: 1,
                        fontSize: "0.75rem",
                        display: "block",
                        overflowX: "auto",
                      },
                      "& th, & td": {
                        border: "1px solid",
                        borderColor: "grey.300",
                        px: 1,
                        py: 0.5,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      },
                      "& th": {
                        bgcolor: "grey.100",
                        fontWeight: "bold",
                      },
                      "& ul, & ol": { pl: 2, my: 0.5 },
                      "& li": { my: 0.25 },
                      "& strong": { fontWeight: "bold" },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {normalizeMarkdownContent(message.content)}
                    </ReactMarkdown>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder={placeholder}
          value={userInput}
          onChange={handleInputChange}
          variant="outlined"
          disabled={loading}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <IconButton
            onClick={handleClear}
            disabled={loading || !userInput.trim()}
            color="secondary"
            title="Clear input"
          >
            <Clear />
          </IconButton>
          <Box>
            <Button onClick={onClose} disabled={loading} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !userInput.trim()}
              startIcon={<Send />}
            >
              {loading ? "Processing..." : "Submit"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AiRuleCreationModal;
