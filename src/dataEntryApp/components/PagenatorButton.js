import React from "react";
import { connect } from "react-redux";
import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { FormElementGroup, ValidationResults } from "avni-models";
import { setMoveNext, setValidationResults } from "../reducers/registrationReducer";

const useStyles = makeStyles(theme => ({
  privbuttonStyle: {
    color: "orange",
    width: 110,
    height: 30,
    fontSize: 12,
    borderColor: "orange",
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px",
    backgroundColor: "white"
  },
  nextbuttonStyle: {
    backgroundColor: "orange",
    color: "white",
    height: 30,
    fontSize: 12,
    width: 110,
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px"
  },
  savebuttonStyle: {
    backgroundColor: "orange",
    marginLeft: 630,
    color: "white",
    height: 30,
    fontSize: 12,
    width: 300,
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px"
  },
  topnav: {
    color: "orange",
    fontSize: "12px",
    cursor: "pointer"
  }
}));

const PagenatorButton = ({ children, feg, obs, ...props }) => {
  console.log(" Inside PaginatorButton :: Printing.. props .that e want to look now..");
  console.log(props);
  console.log(props.moveNext);
  const classes = useStyles();
  const onNextBtnClick = () => {
    console.log("In next click method..");
    console.log(" Inside PaginatorButton :: After next click.. props");
    console.log(props);

    const formElementGroup = new FormElementGroup();
    const formElementGroupValidations = formElementGroup.validate(obs, feg.formElements);
    console.log(" Printing.. props.validationResults from reducer");
    console.log(props.validationResults);
    props.setMoveNext(!new ValidationResults(formElementGroupValidations).hasValidationError());
    console.log(" for move next value check..");
    console.log(props.moveNext);
    const allValidationResults = _.unionBy(
      props.validationResults,
      formElementGroupValidations,
      "formIdentifier"
    );
    props.setValidationResults(allValidationResults);
  };
  if (props.type === "text") {
    return (
      <Typography className={classes.topnav} variant="overline" {...props}>
        {" "}
        {children}{" "}
      </Typography>
    );
  } else if (children === "PREVIOUS") {
    return (
      <Button className={classes.privbuttonStyle} type="button" variant="outlined" {...props}>
        {children}{" "}
      </Button>
    );
  } else if (children === "Save") {
    return (
      <div>
        <Button className={classes.nextbuttonStyle} type="button" {...props}>
          {children}
        </Button>
        {/* <Button className={classes.savebuttonStyle} type="button" {...props}>SAVE AND REGISTER ANOTHER INDIVIDUAL</Button> */}
      </div>
    );
  } else {
    return (
      <Button className={classes.nextbuttonStyle} type="button" {...props} onClick={onNextBtnClick}>
        {children}
      </Button>
    );
  }
};

const mapStateToProps = state => ({
  validationResults: state.dataEntry.registration.validationResults,
  moveNext: state.dataEntry.registration.moveNext
});
// const mapDispatchToProps = dispatch => ({
//   setValidationResults : setValidationResults,
//   setMoveNext : setMoveNext
// });

const mapDispatchToProps = {
  setValidationResults: setValidationResults,
  setMoveNext: setMoveNext
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PagenatorButton);
