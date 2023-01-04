import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import { DialogTitle } from "@material-ui/core";
import { SearchForm } from "../../dataEntryApp/views/GlobalSearch/SearchFilterForm";
import {
  getOperationalModules,
  getOrganisationConfig,
  getGenders
} from "../reducers/metadataReducer";

const AddContactGroupSubject = ({
  operationalModules,
  genders,
  organisationConfig,
  onClose,
  setError,
  ...props
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOperationalModules());
    dispatch(getOrganisationConfig());
    dispatch(getGenders());
  }, []);

  const allLoaded = operationalModules && genders && organisationConfig;

  return (
    <Dialog onClose={() => onClose()} aria-labelledby="customized-dialog-title" open={true}>
      <DialogTitle
        id="customized-dialog-title"
        onClose={() => onClose()}
        styles={{ backgroundColor: "black" }}
      >
        Search Subjects
      </DialogTitle>
      {allLoaded && (
        <SearchForm
          operationalModules={operationalModules}
          genders={genders}
          organisationConfigs={organisationConfig}
          searchRequest={{ includeVoided: false }}
          onSearch={filterRequest => props.search(filterRequest)}
        />
      )}
    </Dialog>
  );
};

const mapStateToProps = state => ({
  operationalModules: state.broadcast.operationalModules,
  genders: state.broadcast.genders,
  organisationConfig: state.broadcast.organisationConfig
});

const mapDispatchToProps = {};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AddContactGroupSubject)
);
