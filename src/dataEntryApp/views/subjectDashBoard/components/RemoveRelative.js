import React from "react";
import { makeStyles } from "@material-ui/core/styles";
// import { LineBreak } from "common/components/utils";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { first } from "lodash";
import { withRouter, useHistory } from "react-router-dom";
import Modal from "./CommonModal";
import DialogContent from "@material-ui/core/DialogContent";
// import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
// import DateFnsUtils from "@date-io/date-fns";
// import FormControlLabel from "@material-ui/core/FormControlLabel";
// import Checkbox from "@material-ui/core/Checkbox";
// import FormLabel from "@material-ui/core/FormLabel";
import { FormControl, FormGroup, TextField, Typography } from "@material-ui/core";
// import moment from "moment/moment";
import { noop, isNil, isEmpty } from "lodash";
// import { IconButton, Button, Box } from "@material-ui/core";
// import { searchSubjects, setSubjects } from "../../../reducers/searchReducer";
import { removeRelationShip } from "../../../reducers/relationshipReducer";
// import FindRelativeTable from "./FindRelativeTable";

// import CancelIcon from "@material-ui/icons/Cancel";

const useStyles = makeStyles(theme => ({
  removeButtonStyle: {
    height: "28px",
    zIndex: 1,
    marginTop: "1px",
    boxShadow: "none",
    color: "#0e6eff",
    backgroundColor: "#fff",
    "&:hover": {
      color: "#0e6eff",
      backgroundColor: "#fff"
    }
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
  }
  // form: {
  //   display: "flex",
  //   flexDirection: "column",
  //   margin: "auto",
  //   width: "fit-content"
  // },
  // resetButton: {
  //   fontSize: "13px",
  //   color: "#212529",
  //   "&:hover": {
  //     backgroundColor: "#fff"
  //   },
  //   "&:focus": {
  //     outline: "0"
  //   }
  // },
  // cancelIcon: {
  //   fontSize: "14px"
  // },
  // cancelBtn: {
  //   // color: "orange",
  //   width: 110,
  //   cursor: "pointer",
  //   height: 30,
  //   padding: "4px 25px",
  //   fontSize: 12,
  //   borderRadius: 50,
  //   marginRight: 20
  // },
  // addBtn: {
  //   color: "white",
  //   cursor: "pointer",
  //   height: 30,
  //   padding: "4px 25px",
  //   fontSize: 12,
  //   borderRadius: 50,
  //   marginRight: 20
  //   // backgroundColor: "orange"
  // }
}));

const RemoveRelative = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  // const history = useHistory();
  // const [searchvalue, setSearchvalue] = React.useState("");
  // const [selectRelativeName, setselectRelativeName] = React.useState(null);
  // const [selectedCompletedDate, setSelectedCompletedDate] = React.useState(null);
  // const [filterErrors, setfilterErrors] = React.useState({
  //   SCHEDULED_DATE: "",
  //   RELATIVE_NAME: ""
  // });
  // const [msg, setMsg] = React.useState("");

  // const [selectedVisitTypes, setVisitTypes] = React.useState(null);
  // console.log("Subjects------>", props.subjects);

  // const [value, setValue] = React.useState("");

  // const handleChange = event => {
  //   setValue(event.target.value);
  //   filterErrors["RELATIVE_NAME"] = "";
  //   if (isEmpty(event.target.value) || event.target.value === "") {
  //     filterErrors["RELATIVE_NAME"] = "Name is mandatory";
  //   }
  //   setfilterErrors({ ...filterErrors });
  // };

  const close = () => {
    // if (!moment(selectRelativeName).isValid()) setselectRelativeName(null);
    // // if (!moment(selectedCompletedDate).isValid()) setSelectedCompletedDate(null);
    // filterErrors["RELATIVE_NAME"] = "";
    // filterErrors["SCHEDULED_DATE"] = "";
    // setfilterErrors({ ...filterErrors });
  };

  // const applyClick = () => {
  //   console.log("Valuee------", value);
  //   props.search({ query: value });
  // };
  // const modifySearch = () => {
  //   props.setSubjects();
  //   setValue("");
  // };
  const removeClick = () => {
    props.removeRelationShip(props.relationId);
    console.log("------>Delelete the relativeeee", props.relationId);
    // setValue("");
    // let storage = [];
    // // JSON.parse(sessionStorage.getItem("selectedRelatives"));
    // let localSavedSubject = JSON.parse(sessionStorage.getItem("selectedRelative"));
    // console.log("localSavedSubject------->", localSavedSubject);
    // storage.push(localSavedSubject);
    // sessionStorage.setItem("selectedRelativeslist", JSON.stringify(storage));
    // console.log("localstorage----->", storage);
    // sessionStorage.removeItem("selectedRelative");
    // sessionStorage.clear("selectedRelatives");
  };

  const searchContent = (
    <DialogContent style={{ width: 600, height: "auto" }}>
      <Grid container direction="row" justify="flex-end" alignItems="flex-start">
        <Typography variant="subtitle1" gutterBottom>
          Do you want to remove the relationship between {props.relationAname} and{" "}
          {props.relationBname}?
        </Typography>
      </Grid>
    </DialogContent>
  );

  return (
    <Modal
      content={searchContent}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "openButton",
          // label: t("filterResults"),
          label: "Remove",
          classes: classes.removeButtonStyle
        },
        {
          buttonType: "applyButton",
          label: "Remove",
          classes: classes.btnCustom,
          // redirectTo: return <FindRelativeTable subjectData={props.subjects} />,
          click: removeClick
          // disabled:
          //   !isEmpty(filterErrors["RELATIVE_NAME"]) || !isEmpty(filterErrors["SCHEDULED_DATE"])
        },
        {
          buttonType: "cancelButton",
          label: t("cancel"),
          classes: classes.cancelBtnCustom
        }
      ]}
      title="Remove Relative"
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
  // search: searchSubjects,
  removeRelationShip
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(RemoveRelative)
);
