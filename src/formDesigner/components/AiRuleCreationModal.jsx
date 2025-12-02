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

const AiRuleCreationModal = ({
  open,
  onClose,
  onSubmit,
  title = "Create Rule with AI",
  placeholder = "Describe your rule requirements...",
  loading = false,
  error = null,
  scenariosContent,
  conversationHistory = [],
}) => {
  const [requirements, setRequirements] = useState("");
  const [conversationStage, setConversationStage] = useState("input"); // "input", "scenarios", "complete"
  const [scenariosResponse, setScenariosResponse] = useState("");
  const storageKey = "ai-rule-creation-requirements";

  // Load previous input on mount and manage conversation stage
  useEffect(() => {
    if (open) {
      // Clear stale input on fresh load
      localStorage.removeItem(storageKey);
      setRequirements("");
      // Reset to input stage when opening
      setConversationStage("input");
      setScenariosResponse("");
    }
  }, [open, storageKey]);

  // Update conversation stage when scenariosContent is provided
  useEffect(() => {
    if (scenariosContent) {
      setScenariosResponse(scenariosContent);
      setConversationStage("scenarios");
    }
  }, [scenariosContent]);

  // Save input to localStorage on change
  const handleRequirementsChange = (event) => {
    const value = event.target.value;
    setRequirements(value);
    localStorage.setItem(storageKey, value);
  };

  const handleClose = () => {
    // Reset conversation state when closing
    setConversationStage("input");
    setScenariosResponse("");
    onClose();
  };

  const handleClear = () => {
    setRequirements("");
    setConversationStage("input");
    setScenariosResponse("");
    localStorage.removeItem(storageKey);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    whiteSpace:
                      message.type === "code" ? "pre-wrap" : "pre-line",
                    fontFamily:
                      message.type === "code" ? "monospace" : "inherit",
                    fontSize: message.type === "code" ? "0.75rem" : "0.875rem",
                  }}
                >
                  {message.content}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {conversationStage === "input" && (
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder={placeholder}
            value={requirements}
            onChange={handleRequirementsChange}
            variant="outlined"
            disabled={loading}
            sx={{ mt: 1 }}
          />
        )}

        {conversationStage === "scenarios" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              AI Generated Scenarios:
            </Typography>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                bgcolor: "grey.50",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                whiteSpace: "pre-line",
              }}
            >
              {scenariosResponse}
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              Do these scenarios match what you want? Click "Confirm" to
              generate the final rule code.
            </Typography>
          </Box>
        )}

        {conversationStage === "complete" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "success.main" }}>
              Rule generated successfully! The code has been added to the
              editor.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {conversationStage === "input" && (
            <>
              <IconButton
                onClick={handleClear}
                disabled={loading || !requirements.trim()}
                color="secondary"
                title="Clear input"
              >
                <Clear />
              </IconButton>
              <Box>
                <Button onClick={handleClose} disabled={loading} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button
                  onClick={() => onSubmit && onSubmit(requirements)}
                  variant="contained"
                  disabled={loading || !requirements.trim()}
                  startIcon={<Send />}
                >
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </Box>
            </>
          )}

          {conversationStage === "scenarios" && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={handleClose} disabled={loading} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button
                onClick={() => onSubmit && onSubmit("yes")}
                variant="contained"
                disabled={loading}
                startIcon={<Send />}
              >
                {loading ? "Generating..." : "Confirm & Generate Code"}
              </Button>
            </Box>
          )}

          {conversationStage === "complete" && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={handleClose} variant="contained">
                Done
              </Button>
            </Box>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AiRuleCreationModal;
