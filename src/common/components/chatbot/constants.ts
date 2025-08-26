import React from "react";
import {
  Info as InfoIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { SuggestionCard } from "./types";

export const SUGGESTION_CARDS: SuggestionCard[] = [
  {
    title: "Share about your organisation",
    subtitle:
      "Tell me what your team does, so we can together set up Avni in the right way for you",
    icon: React.createElement(BusinessIcon),
    message: "Let me know more about your programs and work",
  },
  {
    title: "Explore the Avni platform",
    subtitle: "Learn how Avni can support your organisation’s needs",
    icon: React.createElement(InfoIcon),
    message: "What is the Avni platform?",
  },
  {
    title: "Sneak peek at what’s next",
    subtitle: "Stay updated on upcoming features and improvements",
    icon: React.createElement(ScheduleIcon),
    message: "What new features are on the way?",
  },
];

export const CHAT_CONFIG = {
  REQUEST_TIMEOUT: 60000,
  AUTO_FOCUS_DELAY: 100,
  DEFAULT_SERVER_URL: "http://localhost:8023",
};

export const WELCOME_MESSAGE = {
  title: "Hello! I'm your Avni AI assistant.",
  subtitle: "How can I help you today?",
};
