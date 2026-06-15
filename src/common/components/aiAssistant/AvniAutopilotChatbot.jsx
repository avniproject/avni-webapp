/**
 * Floating-button entry point for the Avni Autopilot AI assistant.
 *
 * Mirrors the DifyChatbot pattern: a fixed-position button at the
 * bottom-right that, when clicked, slides in a side panel hosting the
 * native React chat surface (ChatPanel, UploadDropzone, ConfirmationCard,
 * BundleSummary).
 *
 * Unlike DifyChatbot, the panel supports a maximise toggle so users can
 * either keep the assistant docked on the right (400px) or expand it to
 * fill the viewport while a longer generation is in flight.
 *
 * Sibling to DifyChatbot — both are mounted in `rootApp/App.jsx`.
 *
 * Backend: specs/AVNI_WEBAPP_INTEGRATION_SDD.md (`avni-ai-web` FastAPI
 * service). URL is read from `window.ENV.AI_ASSISTANT_URL`.
 */

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Fab,
  Slide,
  IconButton,
  Typography,
  Tooltip,
  Divider,
  Alert,
} from "@mui/material";
import {
  Close,
  Fullscreen,
  FullscreenExit,
  RestartAlt,
} from "@mui/icons-material";
import { setAvniAutopilotOpen } from "../../../rootApp/ducks";
import ChatPanel from "./ChatPanel";
import UploadDropzone from "./UploadDropzone";
import ConfirmationCard from "./ConfirmationCard";
import BundleSummary from "./BundleSummary";
import { useChatSession } from "./useChatSession";

const PANEL_WIDTH = 480;
const HEADER_HEIGHT = 64;
const PANEL_RADIUS = 12;

const AvniAutopilotChatbot = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.app?.isAvniAutopilotOpen);
  const userInfo = useSelector((state) => state.app?.userInfo);

  const [isMaximised, setIsMaximised] = useState(false);
  const {
    sessionId,
    orgName,
    status,
    messages,
    toolCalls,
    pendingChanges,
    bundle,
    uploadResult,
    error,
    start,
    send,
    resolveChanges,
    uploadFiles,
    uploadToAvni,
    downloadBundleUrl,
    uploadErrorLogUrl,
    resetSession,
  } = useChatSession();

  // Boot or re-verify on every open while idle. start() handles the
  // stale-sessionStorage case via aiApi.sessionAlive.
  useEffect(() => {
    if (isOpen && status === "idle") {
      start();
    }
  }, [isOpen, status, start]);

  if (!userInfo) return null;

  const close = () => {
    dispatch(setAvniAutopilotOpen(false));
    setIsMaximised(false);
  };

  const fullReset = async () => {
    await resetSession();
    await start();
  };

  return (
    <>
      {/* Reuses the legacy DifyChatbot sparkles icon so existing users
          recognise it. Pulse pauses on hover to avoid fighting the lift. */}
      {!isOpen && (
        <Tooltip title="Avni Autopilot — AI bundle assistant" placement="left">
          <Fab
            aria-label="Open Avni Autopilot"
            onClick={() => dispatch(setAvniAutopilotOpen(true))}
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
              zIndex: 1201,
              width: 60,
              height: 60,
              background:
                "linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)",
              color: "#fff",
              boxShadow:
                "0 8px 20px rgba(21, 101, 192, 0.45), 0 0 0 4px rgba(66, 165, 245, 0.18)",
              transition:
                "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
              "@keyframes autopilotPulse": {
                "0%": {
                  boxShadow:
                    "0 0 0 0 rgba(66, 165, 245, 0.55), 0 8px 20px rgba(21, 101, 192, 0.45)",
                },
                "70%": {
                  boxShadow:
                    "0 0 0 14px rgba(66, 165, 245, 0), 0 8px 20px rgba(21, 101, 192, 0.45)",
                },
                "100%": {
                  boxShadow:
                    "0 0 0 0 rgba(66, 165, 245, 0), 0 8px 20px rgba(21, 101, 192, 0.45)",
                },
              },
              animation: "autopilotPulse 2.4s ease-out infinite",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1e88e5 100%)",
                transform: "translateY(-2px) scale(1.04)",
                boxShadow:
                  "0 12px 28px rgba(21, 101, 192, 0.55), 0 0 0 6px rgba(66, 165, 245, 0.22)",
                animation: "none",
              },
              "&:active": { transform: "translateY(0) scale(1)" },
            }}
          >
            <Box
              component="img"
              src="/icons/ai-chat-icon.png"
              alt=""
              sx={{
                width: 32,
                height: 32,
                pointerEvents: "none",
                userSelect: "none",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
              }}
            />
          </Fab>
        </Tooltip>
      )}

      {/* Slide-in panel */}
      <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            top: HEADER_HEIGHT + 8,
            right: isMaximised ? 0 : 8,
            width: isMaximised ? "100vw" : PANEL_WIDTH,
            height: `calc(100vh - ${HEADER_HEIGHT + (isMaximised ? 0 : 16)}px)`,
            backgroundColor: "background.paper",
            boxShadow:
              "0 12px 32px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08)",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            // Children handle their own internal scroll — keeps the chat
            // composer pinned to the bottom regardless of card size.
            overflow: "hidden",
            borderRadius: isMaximised ? 0 : `${PANEL_RADIUS}px`,
            border: isMaximised ? "none" : "1px solid",
            borderColor: "divider",
            transition:
              "width 0.25s ease, right 0.25s ease, border-radius 0.25s ease",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              color: "primary.contrastText",
            }}
          >
            <Box
              component="img"
              src="/icons/ai-chat-icon.png"
              alt=""
              sx={{
                width: 24,
                height: 24,
                pointerEvents: "none",
                userSelect: "none",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
              }}
            />
            <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
              Avni Autopilot
              {orgName && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, opacity: 0.8 }}
                >
                  · {orgName}
                </Typography>
              )}
            </Typography>
            <Tooltip title="Start a fresh session">
              <IconButton
                size="small"
                onClick={fullReset}
                sx={{ color: "inherit" }}
              >
                <RestartAlt fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isMaximised ? "Dock to right" : "Maximise"}>
              <IconButton
                size="small"
                onClick={() => setIsMaximised((m) => !m)}
                sx={{ color: "inherit" }}
              >
                {isMaximised ? (
                  <FullscreenExit fontSize="small" />
                ) : (
                  <Fullscreen fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={close}
                sx={{ color: "inherit" }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Transient error banner — recoverable errors don't tear the session down */}
          {error && (
            <Alert
              severity={error.recoverable ? "warning" : "error"}
              onClose={error.recoverable ? () => {} : undefined}
            >
              {error.message}
            </Alert>
          )}

          {/* Dropzone yields the panel to the active card during HITL /
              bundle-ready so the card has the room it needs. */}
          {!pendingChanges && !bundle && (
            <UploadDropzone
              onFiles={uploadFiles}
              disabled={status !== "connected"}
            />
          )}
          {pendingChanges && (
            <ConfirmationCard
              pendingChanges={pendingChanges}
              onResolve={resolveChanges}
            />
          )}
          {bundle && !pendingChanges && (
            <BundleSummary
              bundle={bundle}
              uploadResult={uploadResult}
              downloadBundleUrl={downloadBundleUrl}
              uploadErrorLogUrl={uploadErrorLogUrl}
              onUploadToAvni={uploadToAvni}
            />
          )}

          <Divider />

          {/* Chat — owns whatever vertical space is left */}
          <ChatPanel
            messages={messages}
            toolCalls={toolCalls}
            status={status}
            onSend={send}
            disabled={status !== "connected"}
          />
        </Box>
      </Slide>
    </>
  );
};

export default AvniAutopilotChatbot;
