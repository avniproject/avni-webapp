import { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Send, AutoAwesome, Person } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import ConfirmationCard from "./ConfirmationCard";
import BundleSummary from "./BundleSummary";
import UploadResultCard from "./UploadResultCard";

/**
 * Scrolling message list + one-line composer. Per
 * specs/INLINE_AUTOPILOT_CARDS_SDD.md the message list is the single
 * ordered record of the conversation — text bubbles and interactive
 * cards (`hitl`, `bundle`, `upload`) share the same array and render
 * in chronological order.
 *
 * Props:
 *  - messages: typed entries (see useChatSession.js)
 *  - toolCalls: [{tool, args, call_id, result?}]
 *  - status: "idle" | "connecting" | "connected" | "closed" | "error"
 *  - onSend: (text) => Promise
 *  - onResolveChanges: (interruptId, resolutions) => Promise<boolean>
 *  - onUploadToAvni: () => Promise
 *  - downloadBundleUrl: string | null
 *  - uploadErrorLogUrl: string | null
 *  - disabled: boolean
 *  - isProductionOrg: boolean — blocks the bundle Upload-to-org action
 */
const ChatPanel = ({
  messages,
  toolCalls,
  status,
  onSend,
  onResolveChanges,
  onUploadToAvni,
  downloadBundleUrl,
  uploadErrorLogUrl,
  disabled,
  isProductionOrg,
}) => {
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef(null);

  // Auto-scroll to bottom on every new message.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, toolCalls]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || disabled) return;
    setDraft("");
    await onSend(text);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      <Box
        ref={scrollerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2.5,
          py: 2,
          backgroundColor: "#f7f8fa",
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.18)",
            borderRadius: 4,
          },
        }}
      >
        {messages.map((msg, i) => {
          if (msg.suppressed) return null;
          switch (msg.type) {
            case "hitl":
              return (
                <ConfirmationCard
                  key={i}
                  msg={msg}
                  resolved={msg.resolved}
                  onResolve={onResolveChanges}
                />
              );
            case "bundle":
              return (
                <BundleSummary
                  key={i}
                  msg={msg}
                  downloadBundleUrl={downloadBundleUrl}
                  onUploadToAvni={onUploadToAvni}
                  isProductionOrg={isProductionOrg}
                />
              );
            case "upload":
              return (
                <UploadResultCard
                  key={i}
                  msg={msg}
                  uploadErrorLogUrl={uploadErrorLogUrl}
                />
              );
            case "text":
            default:
              return <MessageRow key={i} msg={msg} />;
          }
        })}
        {toolCalls.map((tc) => (
          <ToolCallRow key={tc.call_id} tc={tc} />
        ))}
      </Box>

      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          p: 1.75,
          backgroundColor: "background.paper",
          display: "flex",
          alignItems: "flex-end",
          gap: 1.25,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              backgroundColor: "#f7f8fa",
              transition: "background-color 0.2s",
              "&.Mui-focused": { backgroundColor: "background.paper" },
            },
          }}
          placeholder={
            status === "idle"
              ? "Starting…"
              : status === "connecting"
                ? "Connecting…"
                : status === "error"
                  ? "Couldn't reach the assistant — click ↻ to retry"
                  : status === "closed"
                    ? "Session ended — click ↻ to start again"
                    : "Ask the assistant…"
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
        <IconButton
          color="primary"
          onClick={submit}
          disabled={disabled || !draft.trim()}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

const MessageRow = ({ msg }) => {
  const isAssistant = msg.role === "assistant";
  const isSystem = msg.role === "system";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        mb: 1.5,
        flexDirection: isAssistant ? "row" : "row-reverse",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: "50%",
          backgroundColor: isAssistant
            ? "primary.main"
            : isSystem
              ? "grey.500"
              : "secondary.main",
          color: "common.white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isAssistant ? (
          <AutoAwesome sx={{ fontSize: 16 }} />
        ) : (
          <Person sx={{ fontSize: 16 }} />
        )}
      </Box>
      <Box
        sx={{
          maxWidth: "85%",
          backgroundColor: isAssistant
            ? "#fff"
            : isSystem
              ? "grey.100"
              : "primary.light",
          color:
            isAssistant || isSystem ? "text.primary" : "primary.contrastText",
          borderRadius: 2.5,
          px: 1.75,
          py: 1.25,
          boxShadow:
            "0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)",
          fontSize: 14,
          lineHeight: 1.55,
          "& p": { my: 0.5 },
          "& code": { fontSize: 12 },
        }}
      >
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </Box>
    </Box>
  );
};

// Friendly progress label per tool — keep in sync with the CLI's
// `_tool_label` in src/chat/repl.py (avni-ai). Unknown tools fall back to
// the technical name so a newly-added tool degrades visibly instead of
// disappearing.
const TOOL_LABELS = {
  generate_bundle: "Building your app…",
  edit_bundle_from_spec: "Updating your app…",
  resume_bundle: "Continuing where we left off…",
  list_bundle_fields: "Listing your app's fields…",
  answer_avni_question: "Finding the answer…",
};

const labelForTool = (tc) => {
  if (tc.tool === "edit_bundle_fields") {
    const n = (tc.args && tc.args.operations && tc.args.operations.length) || 0;
    return n ? `Editing ${n} field(s)…` : "Editing your app's fields…";
  }
  if (tc.tool === "suggest_form_rule") {
    const form = tc.args && tc.args.form_name;
    return form ? `Writing a rule for "${form}"…` : "Writing a form rule…";
  }
  if (tc.tool === "suggest_form_element_rule") {
    const field = tc.args && tc.args.field_name;
    return field ? `Writing a rule for "${field}"…` : "Writing a field rule…";
  }
  return TOOL_LABELS[tc.tool] || `${tc.tool}(…)`;
};

const ToolCallRow = ({ tc }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, pl: 4 }}>
    <CircularProgress size={12} />
    <Chip
      size="small"
      variant="outlined"
      label={labelForTool(tc)}
      sx={{ fontSize: 12 }}
    />
  </Box>
);

export default ChatPanel;
