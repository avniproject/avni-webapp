import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import { DialogActions, DialogTitle } from "@material-ui/core";
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
      <Box style={{ flexDirection: "row-reverse", display: "flex" }}>
        <Button onClick={() => onCancel()}>Cancel</Button>
        <Button disabled={_.isNil(selectedSubject)} onClick={() => onSubjectAdd(selectedSubject)}>
          Add
        </Button>
      </Box>
    </Box>
  );
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

  useEffect(() => {
    dispatch(getOperationalModules());
    dispatch(getOrganisationConfig());
    dispatch(getGenders());
  }, []);

  const showSearchSubjects =
    operationalModules && genders && organisationConfig && _.isNil(subjects);
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
        {showSearchSubjects && (
          <SearchForm
            operationalModules={operationalModules}
            genders={genders}
            organisationConfigs={organisationConfig}
            searchRequest={{ includeVoided: false }}
            onSearch={searchRequest =>
              SubjectSearchService.search(searchRequest).then(subjects =>
                setSubjects(subjects["listOfRecords"])
              )
            }
          />
        )}
        {subjects && (
          <SelectSubjectAndConfirm
            subjects={subjects}
            onSubjectAdd={x => onSubjectAdd(x)}
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
