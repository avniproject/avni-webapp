import React from "react";
import { styled } from '@mui/material/styles';
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Modal from "./CommonModal";
import { noop } from "lodash";
import { searchSubjects, setSubjects } from "../../../reducers/searchReducer";
import FindRelativeTable from "./FindRelativeTable";
import { SearchForm } from "../../GlobalSearch/SearchFilterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const StyledContainer = styled('div')(({ theme }) => ({
  margin: theme.spacing(3.75),
}));

const filterButtonStyle = {
  height: "28px",
  zIndex: 1,
  marginTop: "1px",
  boxShadow: "none",
  backgroundColor: "#0e6eff",
};

const applyButtonStyle = {
  float: "left",
  backgroundColor: "#f27510",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#f27510",
  },
};

const FindRelative = ({
                        subjectType,
                        subjectProfile,
                        operationalModules,
                        genders,
                        organisationConfigs,
                        searchRequest,
                        load,
                        setError,
                        ...props
                      }) => {
  const { t } = useTranslation();

  const close = () => {
    props.setSubjects();
    sessionStorage.removeItem("selectedRelative");
  };

  const modifySearch = () => {
    props.setSubjects();
    sessionStorage.removeItem("selectedRelative");
  };

  const applyHandler = () => {
    props.setSubjects();
    let localSavedRelativeData = [];
    let localsSelctedRelative = JSON.parse(sessionStorage.getItem("selectedRelative"));
    localSavedRelativeData.push(localsSelctedRelative);
    if (localsSelctedRelative !== null) {
      sessionStorage.setItem("selectedRelativeslist", JSON.stringify(localSavedRelativeData));
    }
    sessionStorage.removeItem("selectedRelative");
    setError("");
  };

  const searchContent = (
    <StyledContainer>
      {props.subjects && props.subjects.listOfRecords ? (
        <FindRelativeTable subjectData={props.subjects.listOfRecords.filter(subject => subjectProfile.uuid !== subject.uuid)} />
      ) : (
        <SearchForm
          operationalModules={operationalModules}
          genders={genders}
          organisationConfigs={organisationConfigs}
          searchRequest={searchRequest}
          onSearch={filterRequest => props.search(filterRequest)}
        />
      )}
      <CustomizedBackdrop load={load} />
    </StyledContainer>
  );

  return (
    <Modal
      fullScreen
      content={searchContent}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "openButton",
          label: t("searchRelative"),
          sx: filterButtonStyle,
        },
        props.subjects && props.subjects.listOfRecords
          ? {
            buttonType: "applyFloating",
            label: "OK",
            sx: applyButtonStyle,
            click: applyHandler,
            left: 40,
          }
          : "",
        props.subjects && props.subjects.listOfRecords
          ? {
            buttonType: "modifySearchFloating",
            label: "Modify search",
            sx: applyButtonStyle,
            click: modifySearch,
            left: 95,
          }
          : "",
      ]}
      title={t("searchRelative")}
      btnHandleClose={close}
    />
  );
};

const mapStateToProps = state => ({
  Relations: state.dataEntry.relations,
  subjects: state.dataEntry.search.subjects,
  searchParams: state.dataEntry.search.subjectSearchParams,
  subjectType: state.dataEntry.subjectProfile.subjectProfile.subjectType,
  load: state.dataEntry.loadReducer.load,
});

const mapDispatchToProps = {
  search: searchSubjects,
  setSubjects,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FindRelative)
);