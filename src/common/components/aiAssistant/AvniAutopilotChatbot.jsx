/**
 * Floating-button entry point for the Avni Autopilot AI assistant.
 *
 * A draggable floating button (defaults to bottom-right, position
 * persisted to localStorage) opens a side panel that supports a
 * maximise toggle for longer generations.
 *
 * Backend: specs/AVNI_WEBAPP_INTEGRATION_SDD.md (`avni-ai-web` FastAPI
 * service). URL is read from `window.ENV.AI_ASSISTANT_URL`.
 */

import { useEffect, useRef, useState } from "react";
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
  Button,
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
const FAB_SIZE = 60;
const FAB_POSITION_STORAGE_KEY = "avni-autopilot-fab-position";
const DRAG_THRESHOLD_PX = 5;

const loadStoredFabPosition = () => {
  try {
    const raw = window.localStorage.getItem(FAB_POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number")
      return null;
    return parsed;
  } catch {
    return null;
  }
};

const clampFabPosition = ({ x, y }) => ({
  x: Math.max(0, Math.min(window.innerWidth - FAB_SIZE, x)),
  y: Math.max(0, Math.min(window.innerHeight - FAB_SIZE, y)),
});

const AvniAutopilotChatbot = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.app?.isAvniAutopilotOpen);
  const userInfo = useSelector((state) => state.app?.userInfo);

  const [isMaximised, setIsMaximised] = useState(false);
  const [fabPosition, setFabPosition] = useState(() => loadStoredFabPosition());
  const dragStateRef = useRef({
    isDragging: false,
    hasDragged: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  // Re-clamp on viewport resize so a previously-saved position can't
  // strand the FAB off-screen after the window shrinks.
  useEffect(() => {
    const handleResize = () => {
      setFabPosition((current) => (current ? clampFabPosition(current) : null));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const persistFabPosition = (position) => {
    try {
      window.localStorage.setItem(
        FAB_POSITION_STORAGE_KEY,
        JSON.stringify(position),
      );
    } catch {
      // Private mode / disabled storage — position won't persist.
    }
  };

  const handleFabPointerDown = (event) => {
    // Only react to the primary button so right-click context menus
    // and middle-click scroll-anchors still behave as expected.
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      isDragging: true,
      hasDragged: false,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleFabPointerMove = (event) => {
    const state = dragStateRef.current;
    if (!state.isDragging) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (
      !state.hasDragged &&
      (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX)
    ) {
      state.hasDragged = true;
    }
    if (state.hasDragged) {
      setFabPosition(
        clampFabPosition({ x: state.originX + dx, y: state.originY + dy }),
      );
    }
  };

  const handleFabPointerUp = (event) => {
    const state = dragStateRef.current;
    if (!state.isDragging) return;
    state.isDragging = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (state.hasDragged) {
      setFabPosition((current) => {
        if (current) persistFabPosition(current);
        return current;
      });
    } else {
      dispatch(setAvniAutopilotOpen(true));
    }
  };
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
      {!isOpen && (
        <Tooltip
          title="Avni Autopilot — drag to move, click to open"
          placement="left"
        >
          <Fab
            aria-label="Open Avni Autopilot"
            onPointerDown={handleFabPointerDown}
            onPointerMove={handleFabPointerMove}
            onPointerUp={handleFabPointerUp}
            onPointerCancel={handleFabPointerUp}
            sx={{
              position: "fixed",
              ...(fabPosition
                ? { top: fabPosition.y, left: fabPosition.x }
                : { bottom: 20, right: 20 }),
              touchAction: "none",
              cursor: "grab",
              zIndex: 1201,
              width: FAB_SIZE,
              height: FAB_SIZE,
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
              "&:active": {
                transform: "translateY(0) scale(1)",
                cursor: "grabbing",
              },
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

      <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            top: HEADER_HEIGHT + 8,
            right: 8,
            left: isMaximised ? 8 : "auto",
            width: isMaximised ? "auto" : PANEL_WIDTH,
            height: `calc(100vh - ${HEADER_HEIGHT + 16}px)`,
            backgroundColor: "background.paper",
            boxShadow:
              "0 12px 32px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08)",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            // Children handle their own internal scroll — keeps the chat
            // composer pinned to the bottom regardless of card size.
            overflow: "hidden",
            borderRadius: `${PANEL_RADIUS}px`,
            border: "1px solid",
            borderColor: "divider",
            transition:
              "width 0.25s ease, left 0.25s ease, border-radius 0.25s ease",
          }}
        >
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
          {pendingChanges &&
            pendingChanges.changes.length >= 8 &&
            !isMaximised && (
              <Alert
                severity="info"
                sx={{ mx: 1.5, mt: 1, alignItems: "center" }}
                action={
                  <Button
                    size="small"
                    startIcon={<Fullscreen />}
                    onClick={() => setIsMaximised(true)}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Maximise
                  </Button>
                }
              >
                {pendingChanges.changes.length} changes to review — maximise for
                easier handling.
              </Alert>
            )}
          {pendingChanges && (
            <ConfirmationCard
              pendingChanges={pendingChanges}
              onResolve={resolveChanges}
              isMaximised={isMaximised}
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
