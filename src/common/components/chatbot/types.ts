export interface Message {
  sender: "user" | "assistant" | "error";
  text: string;
  timestamp: Date;
}

export interface SuggestionCard {
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  message: string;
}

export interface ChatbotProps {
  // Add any props if needed in the future
}

export interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

export interface WelcomeScreenProps {
  onSuggestionClick: (message: string) => void;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

export interface ChatMessageProps {
  message: Message;
}

export interface SuggestionCardsProps {
  onSuggestionClick: (message: string) => void;
}
