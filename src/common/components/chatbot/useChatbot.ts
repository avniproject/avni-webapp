import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Message } from "./types";
import { CHAT_CONFIG } from "./constants";
import httpClient from "../../utils/httpClient";

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAbortController, setCurrentAbortController] =
    useState<AbortController | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const genericConfig = useSelector(
    (state: any) => state.app?.genericConfig || {},
  );

  const configuredUrl =
    genericConfig.avniMcpServerUrl || CHAT_CONFIG.DEFAULT_SERVER_URL;
  const isLocalDevelopment = configuredUrl.includes("localhost");
  const chatEndpoint = isLocalDevelopment ? "/chat" : `${configuredUrl}/chat`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, CHAT_CONFIG.AUTO_FOCUS_DELAY);
    }
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setIsLoading(true);

    // Maintain focus on input after sending message
    setTimeout(() => {
      inputRef.current?.focus();
    }, CHAT_CONFIG.AUTO_FOCUS_DELAY);

    const abortController = new AbortController();
    setCurrentAbortController(abortController);
    const timeoutId = setTimeout(
      () => abortController.abort(),
      CHAT_CONFIG.REQUEST_TIMEOUT,
    );

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
        body: JSON.stringify({ message: textToSend }),
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
      setCurrentAbortController(null);
      // Restore focus after response is complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, CHAT_CONFIG.AUTO_FOCUS_DELAY);
    }
  };

  const handleStop = () => {
    if (currentAbortController) {
      currentAbortController.abort();
      setCurrentAbortController(null);
      setIsLoading(false);
      // Restore focus after stopping request
      setTimeout(() => {
        inputRef.current?.focus();
      }, CHAT_CONFIG.AUTO_FOCUS_DELAY);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (isLoading) {
        handleStop();
      } else {
        handleSend();
      }
    }
  };

  const handleSuggestionClick = (message: string) => {
    // Show the clicked suggestion as an assistant message instead of user message
    const assistantMessage: Message = {
      sender: "assistant",
      text: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return {
    // State
    messages,
    input,
    setInput,
    isOpen,
    setIsOpen,
    isLoading,
    messagesEndRef,
    inputRef,

    // Actions
    handleSend,
    handleStop,
    handleKeyPress,
    handleSuggestionClick,
  };
};
