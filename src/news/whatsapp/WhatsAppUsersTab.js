import React, { useEffect, useState } from "react";

import { useHistory, withRouter } from "react-router-dom";
import SearchUserAndConfirm from "./SearchUserAndConfirm";
import { Box, LinearProgress } from "@material-ui/core";
import WhatsAppMessagesView from "./WhatsAppMessagesView";
import Button from "@material-ui/core/Button";
import ReceiverType from "./ReceiverType";
import UserService from "../../common/service/UserService";
import BroadcastPath from "../utils/BroadcastPath";

const WorkflowStateNames = {
  Searching: "Searching",
  ChooseUser: "ChooseUser",
  ViewUserMessages: "ViewUserMessages"
};

function WhatsAppUsersTab({ receiverId }) {
  const [workflowState, setWorkflowState] = useState({ name: WorkflowStateNames.ChooseUser });
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
  const history = useHistory();
  const routeToMessages = user => {
    history.push(`${BroadcastPath.UserFullPath}/${user.id}/messages`);
  };
  return (
    <div className="container">
      {workflowState.name === WorkflowStateNames.Searching && <LinearProgress />}
      {workflowState.name === WorkflowStateNames.ChooseUser && (
        <SearchUserAndConfirm
          onUserSelected={user => routeToMessages(user)}
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
          <Box style={{ display: "flex", flexDirection: "row-reverse", marginTop: 10 }}>
            <Button
              onClick={() => history.push(`${BroadcastPath.UserFullPath}`)}
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

export default withRouter(WhatsAppUsersTab);
