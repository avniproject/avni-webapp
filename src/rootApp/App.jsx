import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/material";
import Routes from "./Routes";
import { getUserInfo } from "./ducks";
import IdpDetails from "./security/IdpDetails";
import { httpClient } from "../common/utils/httpClient";
import Footer from "../common/components/Footer";
import DifyChatbot from "../common/components/DifyChatbot";

const App = () => {
  const dispatch = useDispatch();
  const isChatOpen = useSelector((state) => state.app.isChatOpen);

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
          marginRight: isChatOpen ? "400px" : "0",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Routes />
        </Box>
      </Box>
      <Footer />
      <DifyChatbot />
    </Box>
  );
};

export default App;
