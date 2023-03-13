import React, { useState } from "react";

import { withRouter } from "react-router-dom";
import SearchUserAndConfirm from "./SearchUserAndConfirm";
import { Box } from "@material-ui/core";
import WhatsAppMessagesView from "./WhatsAppMessagesView";
import Button from "@material-ui/core/Button";
import ReceiverType from "./ReceiverType";

const WorkflowStateNames = {
  ChooseUser: "ChooseUser",
  ViewUserMessages: "ViewUserMessages"
};

function WhatsAppUsersTab({ onClose }) {
  const [workflowState, setWorkflowState] = useState({ name: WorkflowStateNames.ChooseUser });
  const onCloseHandler = () => onClose();

  return (
    <Box style={{ marginLeft: 20, display: "flex", flexGrow: 1 }}>
      {workflowState.name === WorkflowStateNames.ChooseUser && (
        <SearchUserAndConfirm
          onUserSelected={user =>
            setWorkflowState({
              name: WorkflowStateNames.ViewUserMessages,
              user: user
            })
          }
          onCancel={onCloseHandler}
          confirmButtonText={"View Messages"}
        />
      )}
      {workflowState.name === WorkflowStateNames.ViewUserMessages && (
        <Box>
          <WhatsAppMessagesView
            receiverId={workflowState.user.id}
            receiverType={ReceiverType.User}
          />
          <Box style={{ display: "flex", flexDirection: "row-reverse", marginTop: 10 }}>
            <Button
              onClick={() => setWorkflowState({ name: WorkflowStateNames.ChooseUser })}
              variant="outlined"
            >
              Back to search
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default withRouter(WhatsAppUsersTab);
