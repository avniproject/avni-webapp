import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/material";
import Routes from "./Routes";
import { getUserInfo } from "./ducks";
import IdpDetails from "./security/IdpDetails";
import { httpClient } from "../common/utils/httpClient";
import Footer from "../common/components/Footer";
// DifyChatbot temporarily hidden — see App.jsx render block.
// import DifyChatbot from "../common/components/DifyChatbot";
import AvniAutopilotChatbot from "../common/components/aiAssistant/AvniAutopilotChatbot";

const App = () => {
  const dispatch = useDispatch();
  const isChatOpen = useSelector((state) => state.app.isChatOpen);
  const isAvniAutopilotOpen = useSelector(
    (state) => state.app.isAvniAutopilotOpen,
  );

  const appInitialised = useSelector(
    (state) => state.app?.appInitialised || false,
  );
  const sagaErrorState = useSelector((state) => state.sagaErrorState || {});

  const { errorRaised = false, error = null } = sagaErrorState;

  useEffect(() => {
    if (httpClient.idp.idpType === IdpDetails.none) {
      dispatch(getUserInfo());
    }
  }, [dispatch]);

  if (errorRaised) throw error;

  if (!appInitialised) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          transition: "margin-right 0.3s ease",
          // When either assistant docks on the right, reserve the panel
          // width. The autopilot's maximised mode covers the page anyway, so
          // its docked width (480px) is what's reserved here.
          marginRight: isChatOpen
            ? "400px"
            : isAvniAutopilotOpen
              ? "480px"
              : "0",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Routes />
        </Box>
      </Box>
      <Footer />
      {/* DifyChatbot hidden temporarily while Avni Autopilot is the primary
          AI assistant entry point. Re-enable by uncommenting. */}
      {/* <DifyChatbot /> */}
      <AvniAutopilotChatbot />
    </Box>
  );
};

export default App;
