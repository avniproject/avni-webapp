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

const FormWizardHeader = ({ subject }) => {
  const classes = useStyle();
  const { i18n, t } = useTranslation();
  let headerElements = [];

  const addElement = (label, value, headerElements) => {
    const insertSeparator = headerElements.length !== 0;
    headerElements.push(
      <Typography variant="caption" gutterBottom>
        {(insertSeparator ? " | " : "") + label + ": "}
      </Typography>
    );
    headerElements.push(
      <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
        {value}
      </Typography>
    );
    return headerElements;
  };
  const fullName = subject.nameString || "-";
  headerElements = addElement(t("name"), fullName, headerElements);

  if (subject.isPerson()) {
    const dateOfBirth = isDate(subject.dateOfBirth)
      ? AgeUtil.getDisplayAge(subject.dateOfBirth, i18n)
      : null;
    headerElements = dateOfBirth && addElement(t("age"), dateOfBirth, headerElements);
    const gender = subject.gender && !isNil(subject.gender.name) ? subject.gender.name : "-";
    headerElements = addElement(t("gender"), gender, headerElements);
  }
  const lowestAddressLevel = subject.lowestAddressLevel
    ? subject.lowestAddressLevel.name || "-"
    : "";
  const lowestAddressLevelType = subject.lowestAddressLevel
    ? t(subject.lowestAddressLevel.type) || "-"
    : "";
  headerElements = addElement(lowestAddressLevelType, lowestAddressLevel, headerElements);
  return (
    <div className={classes.details}>
      {headerElements}
      <LineBreak num={2} />
    </div>
  );
};

export default FormWizardHeader;
