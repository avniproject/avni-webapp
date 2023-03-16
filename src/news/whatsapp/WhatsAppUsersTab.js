import React, { useEffect, useState } from "react";

import { useHistory, withRouter } from "react-router-dom";
import SearchUserAndConfirm from "./SearchUserAndConfirm";
import { Box } from "@material-ui/core";
import WhatsAppMessagesView from "./WhatsAppMessagesView";
import Button from "@material-ui/core/Button";
import ReceiverType from "./ReceiverType";
import UserService from "../../common/service/UserService";
import BroadcastPath from "../utils/BroadcastPath";

const WorkflowStateNames = {
  ChooseUser: "ChooseUser",
  ViewUserMessages: "ViewUserMessages"
};

function WhatsAppUsersTab({ receiverId }) {
  const [workflowState, setWorkflowState] = useState({ name: WorkflowStateNames.ChooseUser });
  useEffect(() => {
    if (receiverId) {
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
    history.push(`/${BroadcastPath.UserFullPath}/${user.id}/messages`);
  };
  return (
    <Box style={{ marginLeft: 20, display: "flex", flexGrow: 1 }}>
      {workflowState.name === WorkflowStateNames.ChooseUser && (
        <SearchUserAndConfirm
          onUserSelected={user => routeToMessages(user)}
          confirmButtonText={"View Messages"}
        />
      )}
      {workflowState.name === WorkflowStateNames.ViewUserMessages && (
        <Box>
          <WhatsAppMessagesView
            receiverId={workflowState.user.id}
            receiverType={ReceiverType.User}
            receiverName={workflowState.user.name}
          />
          <Box style={{ display: "flex", flexDirection: "row-reverse", marginTop: 10 }}>
            <Button onClick={() => history.push("/broadcast/whatsApp/users")} variant="outlined">
              Back to search
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default withRouter(WhatsAppUsersTab);
