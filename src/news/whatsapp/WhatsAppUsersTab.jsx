import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchUserAndConfirm from "./SearchUserAndConfirm";
import { Box, LinearProgress, Button } from "@mui/material";
import WhatsAppMessagesView from "./WhatsAppMessagesView";
import ReceiverType from "./ReceiverType";
import UserService from "../../common/service/UserService";
import BroadcastPath from "../utils/BroadcastPath";

const WorkflowStateNames = {
  Searching: "Searching",
  ChooseUser: "ChooseUser",
  ViewUserMessages: "ViewUserMessages"
};

function WhatsAppUsersTab({ receiverId }) {
  const [workflowState, setWorkflowState] = useState({
    name: WorkflowStateNames.ChooseUser
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (receiverId) {
      setWorkflowState({ name: WorkflowStateNames.Searching });
      UserService.searchUserById(receiverId).then(user =>
        setWorkflowState({
          name: WorkflowStateNames.ViewUserMessages,
          user: user.data
        })
      );
    }
  }, [receiverId]);

  const routeToMessages = user => {
    navigate(`${BroadcastPath.UserFullPath}/${user.id}/messages`);
  };

  return (
    <div className="container">
      {workflowState.name === WorkflowStateNames.Searching && (
        <LinearProgress />
      )}
      {workflowState.name === WorkflowStateNames.ChooseUser && (
        <SearchUserAndConfirm
          onUserSelected={routeToMessages}
          confirmButtonText={"View Messages"}
        />
      )}
      {workflowState.name === WorkflowStateNames.ViewUserMessages && (
        <div>
          <WhatsAppMessagesView
            receiverId={workflowState.user.id}
            receiverType={ReceiverType.User}
            receiverName={workflowState.user.name}
          />
          <Box sx={{ display: "flex", flexDirection: "row-reverse", mt: 2 }}>
            <Button
              onClick={() => {
                setWorkflowState({ name: WorkflowStateNames.ChooseUser });
                navigate(`${BroadcastPath.UserFullPath}`);
              }}
              variant="outlined"
            >
              Back to search
            </Button>
          </Box>
        </div>
      )}
    </div>
  );
}

export default WhatsAppUsersTab;
