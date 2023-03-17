import React, { useEffect, useState } from "react";
import ChooseSubject from "./ChooseSubject";
import { Box, LinearProgress } from "@material-ui/core";
import { useHistory, withRouter } from "react-router-dom";
import _ from "lodash";
import WhatsAppMessagesView from "./WhatsAppMessagesView";
import Button from "@material-ui/core/Button";
import ReceiverType from "./ReceiverType";
import SubjectSearchService from "../../dataEntryApp/services/SubjectSearchService";
import BroadcastPath from "../utils/BroadcastPath";

const WorkflowStateNames = {
  Searching: "Searching",
  ChooseSubject: "ChooseSubject",
  ViewSubjectMessages: "ViewSubjectMessages"
};

function WhatsAppSubjectsTab({ receiverId }) {
  const [workflowState, setWorkflowState] = useState({ name: WorkflowStateNames.ChooseSubject });

  useEffect(() => {
    if (receiverId) {
      setWorkflowState({ name: WorkflowStateNames.Searching });
      SubjectSearchService.searchByUuid(receiverId).then(subject =>
        setWorkflowState({
          name: WorkflowStateNames.ViewSubjectMessages,
          subject: subject
        })
      );
    }
  }, [receiverId]);
  const history = useHistory();
  const routeToMessages = subject => {
    history.push(`${BroadcastPath.SubjectFullPath}/${subject.uuid}/messages`);
  };
  return (
    <div className="container">
      {workflowState.name === WorkflowStateNames.Searching && <LinearProgress />}
      {workflowState.name === WorkflowStateNames.ChooseSubject && (
        <ChooseSubject
          onCancel={_.noop}
          confirmActionLabel="View Messages"
          onSubjectChosen={subject => routeToMessages(subject)}
          busy={false}
        />
      )}
      {workflowState.name === WorkflowStateNames.ViewSubjectMessages && (
        <div>
          <WhatsAppMessagesView
            receiverId={workflowState.subject.id}
            receiverType={ReceiverType.Subject}
            receiverName={workflowState.subject.fullName}
          />
          <Box style={{ display: "flex", flexDirection: "row-reverse", marginTop: 10 }}>
            <Button
              onClick={() => history.push(`${BroadcastPath.SubjectFullPath}`)}
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

export default withRouter(WhatsAppSubjectsTab);
