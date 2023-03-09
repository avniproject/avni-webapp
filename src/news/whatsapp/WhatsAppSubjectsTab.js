import React, { useState } from "react";
import ChooseSubject from "./ChooseSubject";
import { Box } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import WhatsAppSubjectView from "./WhatsAppSubjectView";
import Button from "@material-ui/core/Button";

const WorkflowStateNames = {
  ChooseSubject: "ChooseSubject",
  ViewSubjectMessages: "ViewSubjectMessages"
};

function WhatsAppSubjectsTab() {
  const [workflowState, setWorkflowState] = useState({ name: WorkflowStateNames.ChooseSubject });

  return (
    <Box style={{ marginLeft: 20 }}>
      {workflowState.name === WorkflowStateNames.ChooseSubject && (
        <ChooseSubject
          onCancel={_.noop}
          confirmActionLabel="Open"
          onSubjectChosen={subject =>
            setWorkflowState({
              name: WorkflowStateNames.ViewSubjectMessages,
              subject: subject
            })
          }
          busy={false}
        />
      )}
      {workflowState.name === WorkflowStateNames.ViewSubjectMessages && (
        <Box>
          <WhatsAppSubjectView subjectId={workflowState.subject.id} />
          <Box style={{ display: "flex", flexDirection: "row-reverse", marginTop: 10 }}>
            <Button
              onClick={() => setWorkflowState({ name: WorkflowStateNames.ChooseSubject })}
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

export default withRouter(WhatsAppSubjectsTab);
