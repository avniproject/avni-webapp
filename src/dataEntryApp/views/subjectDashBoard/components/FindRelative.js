import { makeStyles } from "@mui/styles";
import React from "react";

import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Modal from "./CommonModal";
import { noop } from "lodash";
import { searchSubjects, setSubjects } from "../../../reducers/searchReducer";
import FindRelativeTable from "./FindRelativeTable";
import { SearchForm } from "../../GlobalSearch/SearchFilterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  filterButtonStyle: {
    height: "28px",
    zIndex: 1,
    marginTop: "1px",
    boxShadow: "none",
    backgroundColor: "#0e6eff"
  },
  btnCustom: {
    float: "left",
    backgroundColor: "#f27510",
    height: "30px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#f27510"
    }
  },
  cancelBtnCustom: {
    float: "left",
    backgroundColor: "#F8F9F9",
    color: "#fc9153",
    border: "1px solid #fc9153",
    height: "30px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#F8F9F9"
    }
  },
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto"
    // width: "fit-content"
  },
  resetButton: {
    fontSize: "13px",
    color: "#212529",
    "&:hover": {
      backgroundColor: "#fff"
    },
    "&:focus": {
      outline: "0"
    }
  },
  cancelIcon: {
    fontSize: "14px"
  },
  cancelBtn: {
    // color: "orange",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    marginRight: 20
  },
  addBtn: {
    color: "white",
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    marginRight: 20
    // backgroundColor: "orange"
  }
}));

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
  const classes = useStyles();

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
    <div style={{ margin: "30px" }}>
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
    </div>
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
          classes: classes.filterButtonStyle
        },
        props.subjects && props.subjects.listOfRecords
          ? {
              buttonType: "applyFloating",
              label: "OK",
              classes: classes.btnCustom,
              click: applyHandler,
              left: 40
            }
          : "",
        props.subjects && props.subjects.listOfRecords
          ? {
              buttonType: "modifySearchFloating",
              label: "Modify search",
              classes: classes.btnCustom,
              click: modifySearch,
              left: 95
            }
          : ""
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
  load: state.dataEntry.loadReducer.load
});

const mapDispatchToProps = {
  search: searchSubjects,
  setSubjects
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FindRelative)
);
