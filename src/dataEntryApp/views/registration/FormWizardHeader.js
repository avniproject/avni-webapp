import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { LineBreak } from "common/components/utils";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { isNil, isDate } from "lodash";
import { AgeUtil } from "openchs-models";

const useStyle = makeStyles(theme => ({
  detailsstyle: {
    color: "#000",
    fontSize: "bold"
  },
  details: {
    color: "rgba(0, 0, 0, 0.54)",
    backgroundColor: "#F8F9F9",
    height: 40,
    width: "100%",
    padding: 8,
    marginBottom: 10
  }
}));

function addElement(label, value, headerElements, classes, key) {
  const insertSeparator = headerElements.length !== 0;
  headerElements.push(
    <Typography variant="caption" key={`${key}-1`} gutterBottom>
      {(insertSeparator ? " | " : "") + label + ": "}
    </Typography>
  );
  headerElements.push(
    <Typography className={classes.detailsstyle} key={`${key}-2`} variant="caption" gutterBottom>
      {value}
    </Typography>
  );
  return headerElements;
}

const FormWizardHeader = ({ subject }) => {
  const classes = useStyle();
  const { i18n, t } = useTranslation();
  let headerElements = [];

  const fullName = subject.nameString || "-";
  headerElements = addElement(t("name"), fullName, headerElements, classes, "fw-name");

  if (subject.isPerson()) {
    const dateOfBirth = isDate(subject.dateOfBirth)
      ? AgeUtil.getDisplayAge(subject.dateOfBirth, i18n)
      : null;
    headerElements =
      dateOfBirth && addElement(t("age"), dateOfBirth, headerElements, classes, "fw-age");
    const gender = subject.gender && !isNil(subject.gender.name) ? subject.gender.name : "-";
    headerElements = addElement(t("gender"), gender, headerElements, classes, "fw-gender");
  }
  const lowestAddressLevel = subject.lowestAddressLevel
    ? subject.lowestAddressLevel.name || "-"
    : "";
  const lowestAddressLevelType = subject.lowestAddressLevel
    ? t(subject.lowestAddressLevel.type) || "-"
    : "";
  headerElements = addElement(lowestAddressLevelType, lowestAddressLevel, headerElements, classes);
  return (
    <div className={classes.details}>
      {headerElements}
      <LineBreak num={2} />
    </div>
  );
};

export default FormWizardHeader;
