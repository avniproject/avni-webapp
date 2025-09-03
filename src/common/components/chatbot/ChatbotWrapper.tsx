import React from "react";
import { useSelector } from "react-redux";
import { Chatbot } from "./index";

// TODO Remove this component and related functionality in-case we continue using Dify
const ChatbotWrapper: React.FC = () => {
  const appInitialised = useSelector((state: any) => state.app?.appInitialised);
  const userInfo = useSelector((state: any) => state.app?.userInfo);
  const organisation = useSelector((state: any) => state.app?.organisation);
  const genericConfig = useSelector(
    (state: any) => state.app?.genericConfig || {},
  );

  const isLoggedIn = appInitialised && userInfo;
  const isProductionOrg =
    organisation?.organisationCategoryName === "Production";
  const isCopilotEnabled = genericConfig.copilotEnabled;

  const shouldShowChatbot = isLoggedIn && !isProductionOrg && isCopilotEnabled;

  if (!shouldShowChatbot) {
    return null;
  }

  return <Chatbot />;
};

export default ChatbotWrapper;
