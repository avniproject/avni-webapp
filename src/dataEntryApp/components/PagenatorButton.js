import React from "react";
import { connect } from "react-redux";
import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import _, { unionBy, isEmpty } from "lodash";
import { FormElementGroup, ValidationResults } from "avni-models";
import { setValidationResults } from "../reducers/registrationReducer";

const useStyles = makeStyles(theme => ({
  privbuttonStyle: {
    color: "orange",
    width: 110,
    height: 30,
    fontSize: 12,
    borderColor: "orange",
    cursor: "pointer",
    borderRadius: 50,
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
    borderRadius: 50,
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
    borderRadius: 50,
    padding: "4px 25px"
  },
  topnav: {
    color: "orange",
    fontSize: "13px",
    cursor: "pointer",
    border: "none",
    background: "white",

    "&:hover": {
      background: "none",
      border: "none"
    },

    "&:focus": {
      border: "none",
      outlineColor: "white"
    }
  }
}));

const PagenatorButton = ({
  children,
  feg,
  obsHolder,
  validationResults,
  setValidationResults,
  ...props
}) => {
  const classes = useStyles();

  const handleNext = event => {
    //Filtered Form Elements where voided is false, can be removed once handled generically (API/UI)
    const filteredFormElement = _.filter(feg.formElements, fe => fe.voided === false);
    const formElementGroup = new FormElementGroup();
    //const formElementGroupValidations = formElementGroup.validate(obsHolder, feg.formElements);
    // const allValidationResults = unionBy(
    //   validationResults,
    //   formElementGroupValidations,
    //   "formIdentifier"
    // );
    const formElementGroupValidations = formElementGroup.validate(obsHolder, filteredFormElement);
    setValidationResults(formElementGroupValidations);

    if (!isEmpty(formElementGroupValidations)) {
      if (new ValidationResults(formElementGroupValidations).hasValidationError()) {
        event.preventDefault();
      }
    }
  };

  if (props.type === "text") {
    if (children === "NEXT") {
      return (
        <Button className={classes.topnav} type="button" onClick={e => handleNext(e)}>
          {children}{" "}
        </Button>
      );
    } else {
      return (
        <Button className={classes.topnav} {...props} type="button">
          {children}{" "}
        </Button>
      );
    }
  } else if (children === "PREVIOUS") {
    return (
      <Button className={classes.privbuttonStyle} type="button" variant="outlined" {...props}>
        {children}{" "}
      </Button>
    );
  } else if (children === "Save") {
    return (
      <Button className={classes.nextbuttonStyle} type="button" {...props}>
        {children}
      </Button>
    );
  } else {
    return (
      <Button className={classes.nextbuttonStyle} type="button" onClick={e => handleNext(e)}>
        {children}
      </Button>
    );
  }
};

const mapStateToProps = state => ({
  validationResults: state.dataEntry.registration.validationResults
});

const mapDispatchToProps = {
  setValidationResults
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PagenatorButton);
