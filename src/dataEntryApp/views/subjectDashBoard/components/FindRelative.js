import React from "react";
import { store } from "../../../../../src/common/store/createStore";
import { makeStyles } from "@material-ui/core/styles";
import { LineBreak } from "common/components/utils";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { first } from "lodash";
import { withRouter, useHistory } from "react-router-dom";
import Modal from "./CommonModal";
import DialogContent from "@material-ui/core/DialogContent";
import { FormControl, FormGroup, TextField, Typography } from "@material-ui/core";
import moment from "moment/moment";
import { noop, isNil, isEmpty } from "lodash";
import { searchSubjects, setSubjects } from "../../../reducers/searchReducer";
import { types } from "../../../reducers/relationshipReducer";
import FindRelativeTable from "./FindRelativeTable";

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

const FindRelative = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const [selectRelativeName, setselectRelativeName] = React.useState(null);
  // const [selectedCompletedDate, setSelectedCompletedDate] = React.useState(null);
  const [filterErrors, setfilterErrors] = React.useState({
    // SCHEDULED_DATE: "",
    RELATIVE_NAME: ""
  });

  console.log("Subjects------>", props.subjects);

  const [value, setValue] = React.useState("");

  const handleChange = event => {
    setValue(event.target.value);
    filterErrors["RELATIVE_NAME"] = "";
    if (isEmpty(event.target.value) || event.target.value === "") {
      filterErrors["RELATIVE_NAME"] = "Name is mandatory";
    }
    setfilterErrors({ ...filterErrors });
  };

  const close = () => {
    if (!moment(selectRelativeName).isValid()) setselectRelativeName(null);
    // if (!moment(selectedCompletedDate).isValid()) setSelectedCompletedDate(null);
    filterErrors["RELATIVE_NAME"] = "";
    // filterErrors["SCHEDULED_DATE"] = "";
    setfilterErrors({ ...filterErrors });
  };

  const applyClick = () => {
    // console.log("Valuee------", value);
    props.search({ query: value });
  };
  const modifySearch = () => {
    props.setSubjects();
    setValue("");
  };
  const okClick = () => {
    props.setSubjects();
    setValue("");
    let storage = [];
    let localSavedSubject = JSON.parse(sessionStorage.getItem("selectedRelative"));
    console.log("localSavedSubject------->", localSavedSubject);
    storage.push(localSavedSubject);
    store.dispatch({ type: types.SET_LISTOFRELATIVES, value: localSavedSubject });
    sessionStorage.setItem("selectedRelativeslist", JSON.stringify(storage));
    console.log("localstorage----->", storage);
    sessionStorage.removeItem("selectedRelative");
    // sessionStorage.clear("selectedRelatives");
  };

  const searchContent = (
    <DialogContent style={{ width: 600, height: "auto" }}>
      <Grid container direction="row" justify="flex-end" alignItems="flex-start" />
      <form className={classes.form}>
        {props.subjects && props.subjects.content ? (
          ""
        ) : (
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={12}>
              <FormControl>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}> */}

                <Typography variant="subtitle2" gutterBottom>
                  Name
                </Typography>
                <TextField
                  id="standard-multiline-flexible"
                  value={value}
                  onChange={handleChange}
                  error={!isEmpty(filterErrors["RELATIVE_NAME"])}
                  helperText={
                    !isEmpty(filterErrors["RELATIVE_NAME"]) && t(filterErrors["RELATIVE_NAME"])
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
        )}
        <LineBreak num={1} />
        {/* <FormLabel component="legend">{t("visitType")}</FormLabel> */}
        <FormGroup row>
          {/* <FindRelativeTable/> */}
          {/* <Button onClick={() => valueSubmit()}>Find</Button> */}
          {props.subjects && props.subjects.content ? (
            <FindRelativeTable subjectData={props.subjects} />
          ) : (
            ""
          )}
        </FormGroup>
      </form>
    </DialogContent>
  );

  return (
    <Modal
      content={searchContent}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "openButton",
          label: t("filterResults"),
          classes: classes.filterButtonStyle
        },
        props.subjects && props.subjects.content
          ? {
              buttonType: "applyButton",
              label: "OK",
              classes: classes.btnCustom,
              // redirectTo: return <FindRelativeTable subjectData={props.subjects} />,
              click: okClick,
              disabled:
                !isEmpty(filterErrors["RELATIVE_NAME"]) || !isEmpty(filterErrors["SCHEDULED_DATE"])
            }
          : "",
        props.subjects && props.subjects.content
          ? ""
          : {
              buttonType: "findButton",
              label: "Find",
              classes: classes.btnCustom,
              click: applyClick
              // disabled:
              //   !isEmpty(filterErrors["RELATIVE_NAME"]) || !isEmpty(filterErrors["SCHEDULED_DATE"])
            },
        props.subjects && props.subjects.content
          ? {
              buttonType: "modifysearch",
              label: "Modify search",
              classes: classes.btnCustom,
              click: modifySearch,
              disabled:
                !isEmpty(filterErrors["RELATIVE_NAME"]) || !isEmpty(filterErrors["SCHEDULED_DATE"])
            }
          : "",

        props.subjects && props.subjects.content
          ? ""
          : {
              buttonType: "cancelButton",
              label: t("cancel"),
              classes: classes.cancelBtnCustom
            }
      ]}
      title="Find Relative"
      btnHandleClose={close}
    />
  );
};

const mapStateToProps = state => ({
  Relations: state.dataEntry.relations,
  subjects: state.dataEntry.search.subjects,
  searchParams: state.dataEntry.search.subjectSearchParams,
  subjectTypes: first(state.dataEntry.metadata.operationalModules.subjectTypes)
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
