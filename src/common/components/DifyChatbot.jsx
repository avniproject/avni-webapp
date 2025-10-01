import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Slide, useTheme, IconButton } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import IdpDetails from "../../rootApp/security/IdpDetails.ts";
const DifyChatbot = ({ onChatToggle }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const theme = useTheme();

  const [aiConfig, setAiConfig] = useState(null);
  const [configError, setConfigError] = useState(false);

  // Notify parent when panel state changes
  useEffect(() => {
    onChatToggle?.(isPanelOpen);
  }, [isPanelOpen, onChatToggle]);

  // Fetch AI assistant configuration
  useEffect(() => {
    const fetchAiConfig = async () => {
      try {
        const response = await fetch("/config");
        if (response.ok) {
          const config = await response.json();
          setAiConfig(config.copilotConfig);
          setConfigError(false);
        } else {
          setConfigError(true);
        }
      } catch (error) {
        console.error("Failed to fetch AI assistant config:", error);
        setConfigError(true);
      }
    };

    fetchAiConfig();
  }, []);

  // Get user and organization data from Redux state
  const userInfo = useSelector((state) => state.app?.userInfo);
  const organisation = useSelector((state) => state.app?.organisation);
  const authSession = useSelector((state) => state.app?.authSession);
  const authToken = localStorage.getItem(IdpDetails.AuthTokenName);

  useEffect(() => {
    // Doesn't update dify config. We need to keep track of the conversation id to update the inputs and config
    // Update global config with user context when available
    if (window.difyChatbotConfig && (userInfo || authSession || organisation)) {
      const enhancedInputs = {
        user_role:
          authSession?.roles?.join(", ") || userInfo?.roles?.join(", "),
        organisation_name: organisation?.name,
        user_privileges: authSession?.privileges?.join(", "),
        is_admin: authSession?.hasAllPrivileges || false,
      };

      const enhancedSystemVariables = {
        user_id: userInfo?.id || userInfo?.uuid,
        organisation_id: organisation?.id,
        organisation_name: organisation?.name,
      };

      const enhancedUserVariables = {
        name: userInfo?.name || authSession?.username,
        username: userInfo?.username || authSession?.username,
        email: userInfo?.email,
      };

      // Update existing config with user context
      window.difyChatbotConfig = {
        ...window.difyChatbotConfig,
        inputs: enhancedInputs,
        systemVariables: enhancedSystemVariables,
        userVariables: enhancedUserVariables,
      };
    }
  }, [userInfo, organisation, authSession, authToken]);

  useEffect(() => {
    // Don't create button if config failed or copilot is disabled
    if (configError || !aiConfig?.avni_copilot_enabled) {
      return;
    }

    // Create chat button
    const createChatButton = () => {
      // Remove any existing button
      const existing = document.getElementById("dify-chat-button");
      if (existing) existing.remove();

      const chatButton = document.createElement("button");
      chatButton.id = "dify-chat-button";
      chatButton.innerHTML = `
        <img src="/icons/robot-chat-icon.png" alt="Chat with AI" width="32" height="32" style="border-radius: 4px;" />
      `.trim();
      chatButton.style.cssText = `
        position: fixed;
        bottom: ${theme.spacing(2.5)};
        right: ${theme.spacing(2.5)};
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${theme.palette.primary.main};
        color: ${theme.palette.primary.contrastText};
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 1201;
        box-shadow: ${theme.shadows[4]};
        transition: all 0.3s ease;
        display: ${isPanelOpen ? "none" : "flex"};
        align-items: center;
        justify-content: center;
      `;

      chatButton.onmouseover = () => {
        chatButton.style.transform = "scale(1.1)";
        chatButton.style.background = theme.palette.primary.dark;
      };

      chatButton.onmouseout = () => {
        chatButton.style.transform = "scale(1)";
        chatButton.style.background = theme.palette.primary.main;
      };

      chatButton.onclick = () => {
        setIsPanelOpen(true);
      };

      document.body.appendChild(chatButton);
    };

    createChatButton();

    return () => {
      const button = document.getElementById("dify-chat-button");
      if (button) button.remove();
    };
  }, [isPanelOpen, theme, aiConfig, configError]);

  // Build chatbot URL with user context
  const buildChatUrl = () => {
    const token = aiConfig?.avni_copilot_token;

    const baseUrl = `https://udify.app/chat/${token}`;
    const params = new URLSearchParams();

    // Add user context as URL parameters
    if (userInfo?.name || authSession?.name) {
      params.append("user_name", userInfo?.name || authSession?.name);
    }
    if (userInfo?.username || authSession?.username) {
      params.append("username", userInfo?.username || authSession?.username);
    }
    if (organisation?.name) {
      params.append("org_name", organisation?.name);
    }
    if (organisation?.organisationCategoryName) {
      params.append("org_type", organisation?.organisationCategoryName);
    }
    if (authSession?.roles?.length) {
      params.append("user_role", authSession.roles.join(", "));
    }

    params.append("auth_token", authToken);

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  return (
    <>
      {/* Embedded Right Panel */}
      <Slide direction="left" in={isPanelOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            top: 64,
            right: 0,
            width: "40.75rem",
            height: "calc(100vh - 64px)",
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[8],
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            borderLeft: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => setIsPanelOpen(false)}
            sx={{
              position: "absolute",
              left: -20,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              width: 40,
              height: 40,
              zIndex: 1300,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
              boxShadow: theme.shadows[4],
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Chat Content Area */}
          <Box
            sx={{
              flex: 1,
              position: "relative",
              backgroundColor: "#ffffff",
              overflow: "hidden",
              "& iframe": {
                backgroundColor: "#ffffff !important",
              },
            }}
          >
            <iframe
              src={buildChatUrl()}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                backgroundColor: "#ffffff",
                colorScheme: "light",
              }}
              title="Avni Assistant"
            />
          </Box>

          {/* Panel Footer - Optional branding */}
          <Box
            sx={{
              p: theme.spacing(1),
              backgroundColor: theme.palette.grey[50],
              borderTop: `1px solid ${theme.palette.divider}`,
              textAlign: "center",
              fontSize: theme.typography.caption.fontSize,
              color: theme.palette.text.secondary,
            }}
          >
            Powered by Avni
          </Box>
        </Box>
      </Slide>
    </>
  );
};

export default DifyChatbot;
