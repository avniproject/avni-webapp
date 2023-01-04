import React from "react";
import { first } from "lodash";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SelectSubject from "../../../../common/components/subject/SelectSubject";

const FindRelativeTable = ({ subjectData, errormsg }) => {
  const { t } = useTranslation();

  const onSelectedItem = row => {
    sessionStorage.setItem("selectedRelative", JSON.stringify(row));
  };

  return (
    <SelectSubject
      t={t}
      errormsg={errormsg}
      subjectData={subjectData}
      onSelectedItem={onSelectedItem}
    />
  );
};

const mapStateToProps = state => ({
  Relations: state.dataEntry.relations,
  subjects: state.dataEntry.search.subjects,
  searchParams: state.dataEntry.search.subjectSearchParams,
  subjectTypes: first(state.dataEntry.metadata.operationalModules.subjectTypes)
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(FindRelativeTable)
);
