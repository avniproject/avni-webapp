import React from "react";
import { connect } from "react-redux";
import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { unionBy, isEmpty } from "lodash";
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
  const classes = useStyles();

  const handleNext = event => {
    const formElementGroup = new FormElementGroup();
    const formElementGroupValidations = formElementGroup.validate(obs, feg.formElements);
    const allValidationResults = unionBy(
      props.validationResults,
      formElementGroupValidations,
      "formIdentifier"
    );

    props.setValidationResults(allValidationResults);

    if (!isEmpty(allValidationResults)) {
      if (new ValidationResults(allValidationResults).hasValidationError()) {
        event.preventDefault();
      }
    }
  };

  if (props.type === "text") {
    if (children === "NEXT") {
      return (
        <Typography className={classes.topnav} variant="overline" onClick={e => handleNext(e)}>
          {" "}
          {children}{" "}
        </Typography>
      );
    } else {
      return (
        <Typography className={classes.topnav} variant="overline">
          {" "}
          {children}{" "}
        </Typography>
      );
    }
  } else if (children === "PREVIOUS") {
    return (
      <Button className={classes.privbuttonStyle} type="button" variant="outlined">
        {children}{" "}
      </Button>
    );
  } else if (children === "Save") {
    return (
      <Button className={classes.nextbuttonStyle} type="button">
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
