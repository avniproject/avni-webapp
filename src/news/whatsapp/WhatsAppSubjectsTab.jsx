import { useEffect, useState } from "react";
import ChooseSubject from "./ChooseSubject";
import { Box, LinearProgress, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import WhatsAppMessagesView from "./WhatsAppMessagesView";
import ReceiverType from "./ReceiverType";
import SubjectSearchService from "../../dataEntryApp/services/SubjectSearchService";
import BroadcastPath from "../utils/BroadcastPath";

const WorkflowStateNames = {
  Searching: "Searching",
  ChooseSubject: "ChooseSubject",
  ViewSubjectMessages: "ViewSubjectMessages"
};

function WhatsAppSubjectsTab({ receiverId }) {
  const [workflowState, setWorkflowState] = useState({
    name: WorkflowStateNames.ChooseSubject
  });
  const navigate = useNavigate();

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

  const routeToMessages = subject => {
    navigate(`${BroadcastPath.SubjectFullPath}/${subject.uuid}/messages`);
  };

  return (
    <div className="container">
      {workflowState.name === WorkflowStateNames.Searching && (
        <LinearProgress />
      )}
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
          <Box
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              marginTop: 10
            }}
          >
            <Button
              onClick={() => navigate(`${BroadcastPath.SubjectFullPath}`)}
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

export default WhatsAppSubjectsTab;
