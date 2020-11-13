import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { LineBreak } from "common/components/utils";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Modal from "./CommonModal";
import DialogContent from "@material-ui/core/DialogContent";
import { FormControl, FormGroup, TextField, Typography } from "@material-ui/core";
import { noop } from "lodash";
import { searchSubjects, setSubjects } from "../../../reducers/searchReducer";
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

const FindRelative = ({ subjectType, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [value, setValue] = React.useState("");

  const handleChange = event => {
    setValue(event.target.value);
  };

  const close = () => {
    props.setSubjects();
    setValue("");
    sessionStorage.removeItem("selectedRelative");
  };

  const applyClick = e => {
    props.search({ name: value, subjectTypeUUID: subjectType.uuid });
  };
  const modifySearch = () => {
    props.setSubjects();
    setValue("");
    sessionStorage.removeItem("selectedRelative");
  };
  const okClick = () => {
    props.setSubjects();
    setValue("");
    let localSavedRelativeData = [];
    let localsSelctedRelative = JSON.parse(sessionStorage.getItem("selectedRelative"));
    localSavedRelativeData.push(localsSelctedRelative);
    // store.dispatch({ type: types.SET_LISTOFRELATIVES, value: localsSelctedRelative });
    if (localsSelctedRelative !== null) {
      sessionStorage.setItem("selectedRelativeslist", JSON.stringify(localSavedRelativeData));
    }

    sessionStorage.removeItem("selectedRelative");
  };

  const searchContent = (
    <DialogContent style={{ width: "80%", height: "auto" }}>
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
                  {t("name")}
                </Typography>
                <TextField id="standard-multiline-flexible" value={value} onChange={handleChange} />
              </FormControl>
            </Grid>
          </Grid>
        )}
        <LineBreak num={1} />
        <FormGroup row>
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
          label: t("filterRelative"),
          classes: classes.filterButtonStyle
        },
        props.subjects && props.subjects.content
          ? {
              buttonType: "applyButton",
              label: "OK",
              classes: classes.btnCustom,
              // redirectTo: return <FindRelativeTable subjectData={props.subjects} />,
              click: okClick
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
              click: modifySearch
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
  subjectType: state.dataEntry.subjectProfile.subjectProfile.subjectType
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
