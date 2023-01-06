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

const workflowStates = {
  Start: "Start",
  Searching: "Searching",
  SearchCompleted: "SearchCompleted",
  AddingSubject: "AddingSubject"
};

const searchSubject = function(setWorkflowState, searchRequest, setSubjects) {
  setWorkflowState(workflowStates.Searching);
  SubjectSearchService.search(searchRequest).then(subjects => {
    setSubjects(subjects["listOfRecords"]);
    setWorkflowState(workflowStates.SearchCompleted);
  });
};

const AddContactGroupSubject = ({
  operationalModules,
  genders,
  organisationConfig,
  onClose,
  onSubjectAdd,
  setError,
  ...props
}) => {
  const dispatch = useDispatch();
  const [subjects, setSubjects] = useState(null);
  const [workflowState, setWorkflowState] = useState(workflowStates.Start);

  useEffect(() => {
    dispatch(getOperationalModules());
    dispatch(getOrganisationConfig());
    dispatch(getGenders());
  }, []);

  const loading = !(operationalModules && genders && organisationConfig);
  const onCloseHandler = () => onClose();

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
          (workflowState === workflowStates.Start ||
            workflowState === workflowStates.Searching) && (
            <SearchForm
              operationalModules={operationalModules}
              genders={genders}
              organisationConfigs={organisationConfig}
              searchRequest={{ includeVoided: false }}
              onSearch={searchRequest =>
                searchSubject(setWorkflowState, searchRequest, setSubjects)
              }
            />
          )}
        {(loading ||
          workflowState === workflowStates.Searching ||
          workflowState === workflowStates.AddingSubject) && <LinearProgress />}
        {!loading &&
          (workflowState === workflowStates.AddingSubject ||
            workflowState === workflowStates.SearchCompleted) && (
            <SelectSubjectAndConfirm
              subjects={subjects}
              onSubjectAdd={x => {
                setWorkflowState(workflowStates.AddingSubject);
                onSubjectAdd(x);
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
