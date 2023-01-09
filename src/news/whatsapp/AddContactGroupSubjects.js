import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import { DialogActions, DialogTitle, LinearProgress } from "@material-ui/core";
import { SearchForm } from "../../dataEntryApp/views/GlobalSearch/SearchFilterForm";
import {
  getGenders,
  getOperationalModules,
  getOrganisationConfig
} from "../reducers/metadataReducer";
import SubjectSearchService from "../../dataEntryApp/services/SubjectSearchService";
import SelectSubject from "../../common/components/subject/SelectSubject";
import _ from "lodash";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { Close } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import ErrorMessage from "../../common/components/ErrorMessage";
import ContactService from "../api/ContactService";

const SelectSubjectAndConfirm = function({ subjects, onSubjectAdd, onCancel }) {
  const [selectedSubject, setSelectedSubject] = useState(null);

  return (
    <Box style={{ flexDirection: "column", display: "flex" }}>
      <SelectSubject subjectData={subjects} onSelectedItem={setSelectedSubject} errormsg={null} />
      <Box style={{ flexDirection: "row-reverse", display: "flex", marginTop: 20 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => onCancel()}
          style={{ marginLeft: 15 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={_.isNil(selectedSubject)}
          onClick={() => onSubjectAdd(selectedSubject)}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

const WorkflowStates = {
  Start: "Start",
  Searching: "Searching",
  SearchError: "SearchError",
  SearchCompleted: "SearchCompleted",
  AddingSubject: "AddingSubject",
  AddSubjectError: "AddSubjectError"
};

const searchSubject = function(setWorkflowState, searchRequest, setSubjects) {
  setWorkflowState(WorkflowStates.Searching);
  return SubjectSearchService.search(searchRequest).then(subjects => {
    setSubjects(subjects["listOfRecords"]);
    setWorkflowState(WorkflowStates.SearchCompleted);
  });
};

const AddContactGroupSubject = ({
  contactGroupId,
  operationalModules,
  genders,
  organisationConfig,
  onClose,
  onSubjectAdd
}) => {
  const dispatch = useDispatch();
  const [subjects, setSubjects] = useState(null);
  const [workflowState, setWorkflowState] = useState(WorkflowStates.Start);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(getOperationalModules());
    dispatch(getOrganisationConfig());
    dispatch(getGenders());
  }, []);

  const loading = !(operationalModules && genders && organisationConfig);
  const onCloseHandler = () => onClose();

  const displayProgress =
    loading || _.includes([WorkflowStates.Searching, WorkflowStates.AddingSubject], workflowState);
  const displaySelectSubject =
    !loading &&
    _.includes(
      [
        WorkflowStates.AddingSubject,
        WorkflowStates.SearchCompleted,
        WorkflowStates.AddSubjectError
      ],
      workflowState
    );
  const displayError = _.includes(
    [WorkflowStates.SearchError, WorkflowStates.AddSubjectError],
    workflowState
  );

  return (
    <Dialog
      onClose={onCloseHandler}
      aria-labelledby="customized-dialog-title"
      open={true}
      fullScreen
    >
      <DialogTitle
        id="customized-dialog-title"
        onClose={onCloseHandler}
        style={{ backgroundColor: "black", color: "white" }}
      >
        Search subject to add
      </DialogTitle>
      <DialogActions>
        <IconButton onClick={onCloseHandler}>
          <Close />
        </IconButton>
      </DialogActions>
      <Box style={{ padding: 20 }}>
        {!loading &&
          _.includes(
            [WorkflowStates.Start, WorkflowStates.Searching, WorkflowStates.SearchError],
            workflowState
          ) && (
            <SearchForm
              operationalModules={operationalModules}
              genders={genders}
              organisationConfigs={organisationConfig}
              searchRequest={{ includeVoided: false }}
              onSearch={searchRequest =>
                searchSubject(setWorkflowState, searchRequest, setSubjects).catch(error => {
                  setWorkflowState(WorkflowStates.SearchError);
                  setError(error);
                })
              }
            />
          )}
        {displayProgress && <LinearProgress />}
        {displayError && <ErrorMessage error={error} />}
        {displaySelectSubject && (
          <SelectSubjectAndConfirm
            subjects={subjects}
            onSubjectAdd={subject => {
              setWorkflowState(WorkflowStates.AddingSubject);
              ContactService.addSubjectToContactGroup(contactGroupId, subject)
                .then(x => onSubjectAdd(x))
                .catch(error => {
                  setError(error);
                  setWorkflowState(WorkflowStates.AddSubjectError);
                });
            }}
            onCancel={onCloseHandler}
          />
        )}
      </Box>
    </Dialog>
  );
};

const mapStateToProps = state => ({
  operationalModules: state.broadcast.operationalModules,
  genders: state.broadcast.genders,
  organisationConfig: state.broadcast.organisationConfig
});

export default withRouter(connect(mapStateToProps)(AddContactGroupSubject));
