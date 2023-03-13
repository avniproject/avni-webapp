import React, { useState } from "react";

import { withRouter } from "react-router-dom";
import SearchUserAndConfirm from "./SearchUserAndConfirm";
import { Box } from "@material-ui/core";
import WhatsAppMessagesView from "./WhatsAppMessagesView";
import Button from "@material-ui/core/Button";

const WorkflowStateNames = {
  ChooseUser: "ChooseUser",
  ViewUserMessages: "ViewUserMessages"
};

function WhatsAppUsersTab({ onClose }) {
  const [workflowState, setWorkflowState] = useState({ name: WorkflowStateNames.ChooseUser });
  const onCloseHandler = () => onClose();

  return (
    <Box style={{ marginLeft: 20 }}>
      {workflowState.name === WorkflowStateNames.ChooseUser && (
        <SearchUserAndConfirm
          onUserSelected={user =>
            setWorkflowState({
              name: WorkflowStateNames.ViewUserMessages,
              user: user
            })
          }
          onCancel={onCloseHandler}
        />
      )}
      {workflowState.name === WorkflowStateNames.ViewUserMessages && (
        <Box>
          <WhatsAppMessagesView userId={workflowState.user.id} />
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
