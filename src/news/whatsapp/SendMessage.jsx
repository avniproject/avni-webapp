import { useState } from "react";
import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";
import ComposeMessageView from "./ComposeMessageView";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";

const StyledContainer = styled("div")({
  margin: "10px",
  paddingTop: "10px",
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "flex-end"
});

const SendMessage = ({ receiverId, receiverType, onComposedMessage }) => {
  const [sendingMessage, setSendingMessage] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const onSchedulingAttempted = status => {
    setSendingMessage(false);
    setScheduled(status);
    if (status) onComposedMessage();
  };

  return (
    <StyledContainer>
      {sendingMessage && (
        <ComposeMessageView
          receiverId={receiverId}
          receiverType={receiverType}
          onClose={() => setSendingMessage(false)}
          onSchedulingAttempted={onSchedulingAttempted}
        />
      )}
      {scheduled && (
        <CustomizedSnackbar
          variant={scheduled}
          message={
            "success" === scheduled
              ? "Message scheduling successful"
              : "Message scheduling failed"
          }
          getDefaultSnackbarStatus={snackbarStatus =>
            setScheduled(snackbarStatus)
          }
          defaultSnackbarStatus={scheduled}
        />
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setSendingMessage(true)}
      >
        Send Message
      </Button>
    </StyledContainer>
  );
};

export default SendMessage;
